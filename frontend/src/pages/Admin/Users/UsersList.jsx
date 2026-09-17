import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isOnline, plural, useAdminStore } from '../store.js';
import { initials } from '../ui.jsx';

export const formatAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;
};

export const formatDate = (timestamp) => new Date(timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export function UserAvatar({ user, size = 'md' }) {
    return (
        <span className={`admin-user-avatar admin-user-avatar--${size}${isOnline(user) ? ' is-online' : ''}${user.status === 'banned' ? ' is-banned' : ''}`}>
            {initials(user.name)}
        </span>
    );
}

const FILTERS = [
    { value: 'all', label: 'Все' },
    { value: 'online', label: 'Онлайн' },
    { value: 'completed', label: 'Всё пройдено' },
    { value: 'idle', label: 'Без голосов' },
    { value: 'banned', label: 'Заблокированы' },
];

const SORTS = [
    { value: 'activity', label: 'По активности' },
    { value: 'votes', label: 'По голосам' },
    { value: 'joined', label: 'По дате входа' },
    { value: 'name', label: 'По имени' },
];

export default function UsersList() {
    const users = useAdminStore((state) => state.users);
    const nominations = useAdminStore((state) => state.nominations);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('activity');
    const [query, setQuery] = useState('');

    const published = nominations;

    const votesByUser = {};
    published.forEach((nomination) => {
        nomination.allVotes.forEach((vote) => {
            votesByUser[vote.userId] = (votesByUser[vote.userId] ?? 0) + 1;
        });
    });
    const rows = users.map((user) => ({ user, votes: votesByUser[user.id] ?? 0 }));

    const counts = {
        all: rows.length,
        online: rows.filter(({ user }) => isOnline(user)).length,
        completed: rows.filter(({ votes }) => published.length > 0 && votes === published.length).length,
        idle: rows.filter(({ votes, user }) => votes === 0 && user.status !== 'banned').length,
        banned: rows.filter(({ user }) => user.status === 'banned').length,
    };

    const needle = query.trim().toLowerCase().replace(/^@/, '');

    const visible = rows
        .filter(({ user, votes }) => {
            if (filter === 'online') return isOnline(user);
            if (filter === 'completed') return published.length > 0 && votes === published.length;
            if (filter === 'idle') return votes === 0 && user.status !== 'banned';
            if (filter === 'banned') return user.status === 'banned';
            return true;
        })
        .filter(({ user }) => !needle || user.name.toLowerCase().includes(needle) || user.username.toLowerCase().includes(needle) || String(user.telegramId).includes(needle))
        .sort((a, b) => {
            if (sort === 'votes') return b.votes - a.votes;
            if (sort === 'joined') return b.user.joinedAt - a.user.joinedAt;
            if (sort === 'name') return a.user.name.localeCompare(b.user.name, 'ru');
            return b.user.lastSeenAt - a.user.lastSeenAt;
        });

    return (
        <div className="admin-users">
            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">FLAY 2026</span>
                    <h1 className="admin-page__title">
                        Пользователи
                        <sup className="admin-page__count">{users.length}</sup>
                    </h1>
                </div>
            </header>

            <div className="admin-toolbar">
                <div className="admin-tabs" role="tablist">
                    {FILTERS.map((item) => (
                        <button
                            type="button"
                            role="tab"
                            key={item.value}
                            aria-selected={filter === item.value}
                            className={`admin-tabs__tab${filter === item.value ? ' is-active' : ''}${item.value === 'banned' ? ' admin-tabs__tab--danger' : ''}`}
                            onClick={() => setFilter(item.value)}
                        >
                            {item.value === 'online' && <span className="admin-tabs__live" />}
                            {item.label}
                            <span className="admin-tabs__count">{counts[item.value]}</span>
                        </button>
                    ))}
                </div>

                <div className="admin-toolbar__side">
                    <label className="admin-select">
                        <select value={sort} onChange={(event) => setSort(event.target.value)} className="admin-select__input" aria-label="Сортировка">
                            {SORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </label>

                    <label className="admin-search">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm5-2 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, @username или ID" className="admin-search__input" />
                    </label>
                </div>
            </div>

            <div className="admin-card admin-people">
                <div className="admin-people__head" aria-hidden="true">
                    <span>Пользователь</span>
                    <span>Прогресс</span>
                    <span>Первый вход</span>
                    <span>Активность</span>
                    <span>Статус</span>
                </div>

                {visible.length === 0 ? (
                    <div className="admin-empty">
                        <span className="admin-empty__title">Никого не нашлось</span>
                        <span className="admin-empty__text">Проверь написание или выбери другой фильтр.</span>
                    </div>
                ) : (
                    <ul className="admin-people__list">
                        {visible.map(({ user, votes }, index) => {
                            const online = isOnline(user);
                            return (
                                <li className={`admin-people__row${user.status === 'banned' ? ' is-banned' : ''}`} key={user.id} style={{ '--i': Math.min(index, 20) }}>
                                    <Link to={`/admin/users/${user.id}`} className="admin-people__user">
                                        <UserAvatar user={user} />
                                        <span className="admin-people__identity">
                                            <span className="admin-people__name">{user.name}</span>
                                            <span className="admin-people__username">{user.handle}</span>
                                        </span>
                                    </Link>

                                    <span className="admin-people__progress">
                                        <span className="admin-steps" aria-hidden="true">
                                            {published.map((nomination, step) => (
                                                <span className={`admin-steps__step${step < votes ? ' is-done' : ''}`} key={nomination.id} />
                                            ))}
                                        </span>
                                        <span className="admin-people__votes">
                                            {votes}
                                            <span className="admin-people__of">/{published.length}</span>
                                        </span>
                                    </span>

                                    <span className="admin-people__muted" data-label="Первый вход">{formatAgo(user.joinedAt)}</span>

                                    <span className={`admin-people__activity${online ? ' is-online' : ''}`} data-label="Активность">
                                        {online ? 'онлайн' : formatAgo(user.lastSeenAt)}
                                    </span>

                                    <span className="admin-people__status">
                                        {user.status === 'banned'
                                            ? <span className="admin-badge admin-badge--banned">Блокировка</span>
                                            : !user.isAllowed
                                                ? <span className="admin-badge admin-badge--hidden">Нет в списке</span>
                                                : published.length > 0 && votes === published.length
                                                    ? <span className="admin-badge admin-badge--published">Всё пройдено</span>
                                                    : votes === 0
                                                        ? <span className="admin-badge admin-badge--hidden">Без голосов</span>
                                                        : <span className="admin-badge admin-badge--draft">В процессе</span>}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
