import { useSyncExternalStore } from 'react';
import { api } from '../../api/client.js';

const MINUTE = 60 * 1000;

export const DAY = 24 * 60 * MINUTE;

let state = {
    status: 'loading',
    rawNominations: [],
    nominations: [],
    users: [],
    voting: { startsAt: null, endsAt: null },
    events: [],
    allowed: [],
    toast: null,
};

const listeners = new Set();

const setState = (updater) => {
    state = updater(state);
    listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const useAdminStore = (selector) => useSyncExternalStore(subscribe, () => selector(state));

export const plural = (value, one, few, many) => {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
};

export const votesLabel = (value) => `${value} ${plural(value, 'голос', 'голоса', 'голосов')}`;

const toTime = (value) => (value ? new Date(value).getTime() : null);

const toUser = (user) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return {
        id: user.id,
        telegramId: user.telegram_id,
        name: name || `ID ${user.telegram_id}`,
        username: user.telegram_username,
        handle: user.telegram_username ? `@${user.telegram_username}` : `ID ${user.telegram_id}`,
        photo: user.photo_url || null,
        joinedAt: toTime(user.date_joined),
        lastSeenAt: toTime(user.last_seen) ?? toTime(user.date_joined),
        status: user.is_banned ? 'banned' : 'active',
        banReason: user.ban_reason,
        bannedAt: toTime(user.banned_at),
        revokes: user.revokes,
        isAllowed: user.is_allowed,
        isSuperuser: user.is_superuser,
    };
};

const toVoting = (voting) => ({ startsAt: toTime(voting.starts_at), endsAt: toTime(voting.ends_at) });

const toEvent = (event) => ({
    id: event.id,
    type: { first_login: 'join', unvote: 'revoke' }[event.kind] ?? event.kind,
    userId: event.user,
    userName: event.user_name,
    nomination: event.nomination_title,
    nominee: event.candidate_name,
    reason: event.details,
    at: toTime(event.created_at),
});

const toAllowed = (item) => ({
    id: item.id,
    telegramId: item.telegram_id,
    name: item.name,
    createdAt: toTime(item.created_at),
    user: item.user,
});

const buildNominations = (rawNominations, users) => {
    const banned = new Set(users.filter((user) => user.status === 'banned').map((user) => user.id));
    return rawNominations.map((nomination) => {
        const allVotes = nomination.votes.map((vote) => ({
            id: vote.id,
            userId: vote.user,
            candidateId: vote.candidate,
            at: toTime(vote.created_at),
        }));
        return {
            id: nomination.id,
            title: nomination.title,
            description: nomination.description,
            candidates: nomination.candidates,
            allVotes,
            votes: allVotes.filter((vote) => !banned.has(vote.userId)),
        };
    });
};

const patchState = (patch) => setState((current) => {
    const next = { ...current, ...patch };
    return { ...next, nominations: buildNominations(next.rawNominations, next.users) };
});

export const notify = (text, type = 'success') => {
    const id = Date.now();
    setState((current) => ({ ...current, toast: { id, text, type } }));
    setTimeout(() => {
        setState((current) => (current.toast?.id === id ? { ...current, toast: null } : current));
    }, 2600);
};

const fetchNominations = () => api('/admin/nominations/').then((rawNominations) => patchState({ rawNominations }));
const fetchUsers = () => api('/admin/users/').then((users) => patchState({ users: users.map(toUser) }));
const fetchEvents = () => api('/admin/events/').then((events) => patchState({ events: events.map(toEvent) }));
const fetchAllowed = () => api('/admin/allowed-ids/').then((allowed) => patchState({ allowed: allowed.map(toAllowed) }));
const fetchVoting = () => api('/admin/voting/').then((voting) => patchState({ voting: toVoting(voting) }));

export const loadAdmin = async () => {
    try {
        await Promise.all([fetchNominations(), fetchUsers(), fetchEvents(), fetchAllowed(), fetchVoting()]);
        patchState({ status: 'ready' });
    } catch {
        patchState({ status: 'error' });
    }
};

export const refreshAdmin = () => Promise.all([fetchNominations(), fetchUsers(), fetchEvents()]).catch(() => null);

const errorText = (error, fallback) => {
    const data = error?.data;
    if (error?.status === 413) return 'Файл слишком большой';
    if (data?.photo) return 'Не получилось загрузить фото: нужна картинка JPG, PNG или WebP до 5 МБ';
    if (data?.telegram_id) return 'Этот Telegram ID уже в списке';
    return fallback;
};

const mutate = async (request, refresh, fallback = 'Не получилось сохранить, попробуй ещё раз') => {
    try {
        const result = await request();
        await Promise.all(refresh.map((load) => load()));
        return result ?? true;
    } catch (error) {
        notify(errorText(error, fallback), 'error');
        await Promise.all(refresh.map((load) => load().catch(() => null)));
        return null;
    }
};

const reorder = (list, fromIndex, toIndex) => {
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
};

export const TOTAL_USERS_SELECTOR = (current) => current.users.length;

export const findVoter = (id) => state.users.find((user) => user.id === id);

export const getResults = (nomination) => {
    const total = nomination.votes.length;
    return nomination.candidates
        .map((candidate) => {
            const votes = nomination.votes.filter((vote) => vote.candidateId === candidate.id).length;
            return { ...candidate, votes, share: total ? votes / total : 0 };
        })
        .sort((a, b) => b.votes - a.votes);
};

export const addNomination = () => mutate(
    () => api('/admin/nominations/', { method: 'POST', body: { title: 'НОВАЯ НОМИНАЦИЯ' } }),
    [fetchNominations],
);

export const updateNomination = (id, patch) => mutate(
    () => api(`/admin/nominations/${id}/`, { method: 'PATCH', body: patch }),
    [fetchNominations],
);

export const removeNomination = (id) => mutate(
    () => api(`/admin/nominations/${id}/`, { method: 'DELETE' }),
    [fetchNominations],
);

export const moveNomination = (fromIndex, toIndex) => {
    const rawNominations = reorder(state.rawNominations, fromIndex, toIndex);
    patchState({ rawNominations });
    return mutate(
        () => api('/admin/nominations/reorder/', { method: 'POST', body: { ids: rawNominations.map((nomination) => nomination.id) } }),
        [],
        'Не получилось сохранить порядок',
    ).then((result) => {
        if (!result) fetchNominations();
        return result;
    });
};

const candidateForm = (fields) => {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(key, value);
    });
    return form;
};

export const addCandidate = (nominationId, name, photo = null) => mutate(
    () => api(`/admin/nominations/${nominationId}/candidates/`, { method: 'POST', body: candidateForm({ name, photo }) }),
    [fetchNominations],
);

export const setCandidatePhoto = (candidateId, photo) => mutate(
    () => api(`/admin/candidates/${candidateId}/`, { method: 'PATCH', body: candidateForm({ photo }) }),
    [fetchNominations],
);

export const removeCandidate = (candidateId) => mutate(
    () => api(`/admin/candidates/${candidateId}/`, { method: 'DELETE' }),
    [fetchNominations],
);

export const moveCandidate = (nominationId, fromIndex, toIndex) => {
    let ids = [];
    const rawNominations = state.rawNominations.map((nomination) => {
        if (nomination.id !== nominationId) return nomination;
        const candidates = reorder(nomination.candidates, fromIndex, toIndex);
        ids = candidates.map((candidate) => candidate.id);
        return { ...nomination, candidates };
    });
    patchState({ rawNominations });
    return mutate(
        () => api(`/admin/nominations/${nominationId}/candidates/reorder/`, { method: 'POST', body: { ids } }),
        [],
        'Не получилось сохранить порядок',
    ).then((result) => {
        if (!result) fetchNominations();
        return result;
    });
};

export const BAN_REASONS = ['Второй аккаунт', 'Накрутка голосов', 'Не из фанклуба'];

export const isOnline = (user) => Boolean(user.lastSeenAt) && Date.now() - user.lastSeenAt < 5 * MINUTE;

export const getUserVotes = (nominations, userId) => nominations
    .map((nomination) => {
        const vote = nomination.allVotes.find((item) => item.userId === userId);
        return {
            nomination,
            vote,
            candidate: vote ? nomination.candidates.find((candidate) => candidate.id === vote.candidateId) : null,
        };
    });

export const fetchUserEvents = (userId) => api(`/admin/users/${userId}/events/`).then((events) => events.map(toEvent));

export const banUser = (userId, reason, withVotes) => mutate(
    () => api(`/admin/users/${userId}/ban/`, { method: 'POST', body: { reason, with_votes: withVotes } }),
    [fetchUsers, fetchNominations, fetchEvents],
);

export const unbanUser = (userId) => mutate(
    () => api(`/admin/users/${userId}/unban/`, { method: 'POST' }),
    [fetchUsers, fetchNominations, fetchEvents],
);

export const removeUserVote = (userId, nominationId) => mutate(
    () => api(`/admin/users/${userId}/votes/${nominationId}/`, { method: 'DELETE' }),
    [fetchNominations],
);

export const resetUserVotes = (userId) => mutate(
    () => api(`/admin/users/${userId}/votes/`, { method: 'DELETE' }),
    [fetchNominations],
);

export const addAllowed = (telegramId, name) => mutate(
    () => api('/admin/allowed-ids/', { method: 'POST', body: { telegram_id: telegramId, name } }),
    [fetchAllowed, fetchUsers],
);

export const removeAllowed = (id) => mutate(
    () => api(`/admin/allowed-ids/${id}/`, { method: 'DELETE' }),
    [fetchAllowed, fetchUsers],
);

export const getVotingStatus = ({ startsAt, endsAt }, now = Date.now()) => {
    if (!startsAt || !endsAt || now < startsAt) return 'upcoming';
    if (now >= endsAt) return 'finished';
    return 'active';
};

export const isVotingScheduled = ({ startsAt, endsAt }) => Boolean(startsAt && endsAt);

export const startOfDay = (timestamp) => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

export const getVotingDays = ({ startsAt, endsAt }) => Math.max(1, Math.round((startOfDay(endsAt - 1) - startOfDay(startsAt)) / DAY) + 1);

export const formatDuration = (ms) => {
    const totalMinutes = Math.max(0, Math.round(ms / MINUTE));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days} ${plural(days, 'день', 'дня', 'дней')}${hours ? ` ${hours} ч` : ''}`;
    if (hours > 0) return `${hours} ч${minutes ? ` ${minutes} мин` : ''}`;
    return `${minutes} мин`;
};

export const updateVoting = (patch) => {
    const body = {};
    if ('startsAt' in patch) body.starts_at = new Date(patch.startsAt).toISOString();
    if ('endsAt' in patch) body.ends_at = new Date(patch.endsAt).toISOString();
    return mutate(
        () => api('/admin/voting/', { method: 'PATCH', body }),
        [fetchVoting],
        'Не получилось сохранить сроки',
    );
};
