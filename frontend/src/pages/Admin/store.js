import { useSyncExternalStore } from 'react';
import { nominations as siteNominations } from '../../data/nominations.js';
import { onlineUsers, users, voting } from './mocks.js';
import nomineeExample from '../../assets/images/Nominee/nominee-example.png';

const MINUTE = 60 * 1000;

const FIRST_NAMES = ['Алексей', 'Анна', 'Артём', 'Вероника', 'Глеб', 'Екатерина', 'Кирилл', 'Мария', 'Михаил', 'Полина', 'Роман', 'София', 'Тимофей', 'Ульяна', 'Фёдор', 'Юлия', 'Егор'];
const LAST_NAMES = ['Смирнов', 'Кузнецова', 'Попов', 'Соколова', 'Лебедев', 'Козлова', 'Новиков', 'Морозова', 'Волков', 'Павлова', 'Семёнов', 'Голубева', 'Виноградов', 'Богданова', 'Воробьёв', 'Фёдорова', 'Михайлов', 'Белова'];

export const voters = [
    ...users,
    ...Array.from({ length: 35 }, (_, index) => {
        const first = FIRST_NAMES[index % FIRST_NAMES.length];
        const last = LAST_NAMES[(index * 7) % LAST_NAMES.length];
        const isFemale = /[ая]$/.test(first);
        const lastName = isFemale && !/а$/.test(last) ? `${last}а` : !isFemale && /а$/.test(last) ? last.slice(0, -1) : last;
        return { id: 100 + index, name: `${first} ${lastName}`, username: `user${100 + index}` };
    }),
];

export const plural = (value, one, few, many) => {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
};

export const votesLabel = (value) => `${value} ${plural(value, 'голос', 'голоса', 'голосов')}`;

export const titleCase = (value) => value.toLowerCase().replace(/(^|\s|-)\S/g, (letter) => letter.toUpperCase());

const TURNOUT = [38, 35, 31, 29, 33, 22, 18, 26, 30];
const NON_VOTERS = [10, 130, 131, 132, 133, 134];
const WEIGHTS = [9, 6, 5, 4, 3, 2, 2];

const makeCandidates = (nomination, index) => {
    if (nomination.nominees.length) {
        return nomination.nominees.map((nominee) => ({ id: nominee.number, name: titleCase(nominee.name), photo: nominee.image ?? nomineeExample }));
    }

    const size = 4 + (index % 3);
    return Array.from({ length: size }, (_, position) => {
        const user = users[(index * 3 + position * 5) % users.length];
        return { id: position + 1, name: user.name, photo: null };
    });
};

const makeVotes = (candidates, total, seed) => {
    const weights = candidates.map((_, position) => WEIGHTS[(position + seed) % WEIGHTS.length]);
    const sum = weights.reduce((acc, weight) => acc + weight, 0);
    const counts = weights.map((weight) => Math.floor((weight / sum) * total));
    let rest = total - counts.reduce((acc, count) => acc + count, 0);
    for (let position = 0; rest > 0; position = (position + 1) % counts.length, rest -= 1) {
        counts[position] += 1;
    }

    const shuffled = voters.filter((voter) => !NON_VOTERS.includes(voter.id)).sort((a, b) => ((a.id * (seed + 3)) % 47) - ((b.id * (seed + 3)) % 47));
    const votes = [];
    let cursor = 0;
    counts.forEach((count, position) => {
        for (let step = 0; step < count; step += 1) {
            votes.push({
                id: `${seed}-${cursor}`,
                userId: shuffled[cursor].id,
                candidateId: candidates[position].id,
                at: Date.now() - ((cursor * 37 + seed * 11) % 4000) * MINUTE,
            });
            cursor += 1;
        }
    });

    return votes.sort((a, b) => b.at - a.at);
};

let state = {
    nominations: siteNominations.map((nomination, index) => {
        const candidates = makeCandidates(nomination, index);
        return {
            number: nomination.number,
            title: nomination.title,
            description: '',
            candidates,
            votes: makeVotes(candidates, TURNOUT[index] ?? 0, index),
        };
    }),
    users: voters.map((voter, index) => ({
        ...voter,
        joinedAt: Date.now() - ((index * 131) % (3 * 24 * 60)) * MINUTE - 20 * MINUTE,
        lastSeenAt: onlineUsers.includes(voter.id) ? Date.now() : Date.now() - (((index * 53) % 1800) + 12) * MINUTE,
        status: voter.id === 10 ? 'banned' : 'active',
        banReason: voter.id === 10 ? 'Второй аккаунт' : '',
        bannedAt: voter.id === 10 ? Date.now() - 42 * MINUTE : null,
        revokes: [11, 2, 104].includes(voter.id) ? 3 + (index % 3) : index % 7 === 0 ? 1 : 0,
    })),
    voting,
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

export const TOTAL_USERS = voters.length;

export const findVoter = (id) => voters.find((voter) => voter.id === id);

export const getResults = (nomination) => {
    const total = nomination.votes.length;
    return nomination.candidates
        .map((candidate) => {
            const votes = nomination.votes.filter((vote) => vote.candidateId === candidate.id).length;
            return { ...candidate, votes, share: total ? votes / total : 0 };
        })
        .sort((a, b) => b.votes - a.votes);
};

export const notify = (text, type = 'success') => {
    const id = Date.now();
    setState((current) => ({ ...current, toast: { id, text, type } }));
    setTimeout(() => {
        setState((current) => (current.toast?.id === id ? { ...current, toast: null } : current));
    }, 2600);
};

const updateNominations = (updater) => setState((current) => ({ ...current, nominations: updater(current.nominations) }));

export const updateNomination = (number, patch) => updateNominations((list) => list.map((nomination) => (
    nomination.number === number ? { ...nomination, ...patch } : nomination
)));

export const moveNomination = (fromIndex, toIndex) => updateNominations((list) => {
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
});

export const addNomination = () => {
    const number = Math.max(0, ...state.nominations.map((nomination) => nomination.number)) + 1;
    updateNominations((list) => [...list, { number, title: 'НОВАЯ НОМИНАЦИЯ', description: '', candidates: [], votes: [] }]);
    return number;
};

export const removeNomination = (number) => updateNominations((list) => list.filter((nomination) => nomination.number !== number));

export const addCandidate = (number, name, photo = null) => updateNominations((list) => list.map((nomination) => {
    if (nomination.number !== number) return nomination;
    const id = Math.max(0, ...nomination.candidates.map((candidate) => candidate.id)) + 1;
    return { ...nomination, candidates: [...nomination.candidates, { id, name, photo }] };
}));

export const setCandidatePhoto = (number, candidateId, photo) => updateNominations((list) => list.map((nomination) => (
    nomination.number === number
        ? { ...nomination, candidates: nomination.candidates.map((candidate) => (candidate.id === candidateId ? { ...candidate, photo } : candidate)) }
        : nomination
)));

export const removeCandidate = (number, candidateId) => updateNominations((list) => list.map((nomination) => (
    nomination.number === number
        ? {
            ...nomination,
            candidates: nomination.candidates.filter((candidate) => candidate.id !== candidateId),
            votes: nomination.votes.filter((vote) => vote.candidateId !== candidateId),
        }
        : nomination
)));

export const moveCandidate = (number, fromIndex, toIndex) => updateNominations((list) => list.map((nomination) => {
    if (nomination.number !== number) return nomination;
    const candidates = [...nomination.candidates];
    const [moved] = candidates.splice(fromIndex, 1);
    candidates.splice(toIndex, 0, moved);
    return { ...nomination, candidates };
}));

export const BAN_REASONS = ['Второй аккаунт', 'Накрутка голосов', 'Не из фанклуба'];

export const isOnline = (user) => Date.now() - user.lastSeenAt < 5 * MINUTE;

export const getUserVotes = (nominations, userId) => nominations
    .map((nomination) => {
        const vote = nomination.votes.find((item) => item.userId === userId);
        return {
            nomination,
            vote,
            candidate: vote ? nomination.candidates.find((candidate) => candidate.id === vote.candidateId) : null,
        };
    });

const updateUsers = (updater) => setState((current) => ({ ...current, users: updater(current.users) }));

export const banUser = (userId, reason, withVotes) => {
    updateUsers((list) => list.map((user) => (
        user.id === userId ? { ...user, status: 'banned', banReason: reason, bannedAt: Date.now() } : user
    )));
    if (withVotes) {
        updateNominations((list) => list.map((nomination) => ({ ...nomination, votes: nomination.votes.filter((vote) => vote.userId !== userId) })));
    }
};

export const unbanUser = (userId) => updateUsers((list) => list.map((user) => (
    user.id === userId ? { ...user, status: 'active', banReason: '', bannedAt: null } : user
)));

export const removeUserVote = (userId, nominationNumber) => updateNominations((list) => list.map((nomination) => (
    nomination.number === nominationNumber
        ? { ...nomination, votes: nomination.votes.filter((vote) => vote.userId !== userId) }
        : nomination
)));

export const resetUserVotes = (userId) => updateNominations((list) => list.map((nomination) => ({
    ...nomination,
    votes: nomination.votes.filter((vote) => vote.userId !== userId),
})));

export const DAY = 24 * 60 * MINUTE;

export const getVotingStatus = ({ startsAt, endsAt }, now = Date.now()) => {
    if (now < startsAt) return 'upcoming';
    if (now >= endsAt) return 'finished';
    return 'active';
};

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

export const updateVoting = (patch) => setState((current) => ({ ...current, voting: { ...current.voting, ...patch } }));
