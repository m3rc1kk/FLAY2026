import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { nominations } from '../../../data/nominations.js';
import { events as initialEvents, findUser, nominationTurnout, onlineUsers as initialOnline, pastDayVotes, stats as initialStats, users } from '../mocks.js';
import { DAY, formatDuration, getVotingDays, getVotingStatus, startOfDay, useAdminStore } from '../store.js';

const initials = (name) => name.split(' ').map((part) => part[0]).join('').slice(0, 2);

const plural = (value, one, few, many) => {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
};

const formatAgo = (timestamp, now) => {
    const minutes = Math.floor((now - timestamp) / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;
};

const formatDay = (date) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

const percent = (value, total) => (total ? Math.round((value / total) * 100) : 0);

function EventText({ event }) {
    const user = findUser(event.userId);

    if (event.type === 'join') {
        return <><b>{user?.name}</b> · первый вход на сайт</>;
    }

    if (event.type === 'ban') {
        return <><b>{user?.name}</b> · блокировка: {event.reason}</>;
    }

    if (event.type === 'revoke') {
        return <><b>{user?.name}</b> · отмена голоса в «{event.nomination}»</>;
    }

    return (
        <>
            <b>{user?.name}</b> · голос в «{event.nomination}»
            {event.nominee && <span className="admin-feed__target"> за {event.nominee.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())}</span>}
        </>
    );
}

export default function Dashboard() {
    const voting = useAdminStore((state) => state.voting);
    const [now, setNow] = useState(() => Date.now());
    const [stats, setStats] = useState(initialStats);
    const [online, setOnline] = useState(initialOnline);
    const [events, setEvents] = useState(initialEvents);

    useEffect(() => {
        const clock = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(clock);
    }, []);

    const status = getVotingStatus(voting, now);

    useEffect(() => {
        if (status !== 'active') return undefined;

        const tick = setInterval(() => {
            const user = users[Math.floor(Math.random() * users.length)];
            const nomination = nominations[Math.floor(Math.random() * nominations.length)];
            const candidate = nomination.nominees[Math.floor(Math.random() * nomination.nominees.length)];

            setEvents((current) => [
                { id: Date.now(), type: 'vote', userId: user.id, nomination: nomination.title, nominee: candidate?.name ?? null, at: Date.now() },
                ...current,
            ].slice(0, 8));

            setStats((current) => ({ ...current, totalVotes: current.totalVotes + 1, votesToday: current.votesToday + 1 }));

            setOnline((current) => {
                if (current.includes(user.id)) {
                    return Math.random() > .6 && current.length > 3 ? current.slice(1) : current;
                }
                return [user.id, ...current].slice(0, 9);
            });

            setNow(Date.now());
        }, 9000);

        return () => clearInterval(tick);
    }, [status]);

    const totalDays = getVotingDays(voting);
    const firstDay = startOfDay(voting.startsAt);
    const todayIndex = Math.floor((startOfDay(now) - firstDay) / DAY);
    const days = Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(firstDay + index * DAY);
        if (index === todayIndex && status === 'active') return { date, votes: stats.votesToday, state: 'today' };
        if (index < todayIndex || status === 'finished') return { date, votes: pastDayVotes[index % pastDayVotes.length], state: 'past' };
        return { date, votes: null, state: 'future' };
    });
    const isDense = totalDays > 10;
    const maxDayVotes = Math.max(1, ...days.map((day) => day.votes ?? 0));
    const votedPercent = percent(stats.votedUsers, stats.totalUsers);
    const completedPercent = percent(stats.completedUsers, stats.totalUsers);
    const sortedTurnout = [...nominationTurnout].sort((a, b) => b.votes - a.votes);

    return (
        <div className="admin-dashboard">
            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">FLAY 2026</span>
                    <h1 className="admin-page__title">Дашборд</h1>
                </div>

                <Link to="/admin/voting" className={`admin-status is-${status}`}>
                    <span className="admin-status__dot" />
                    <span className="admin-status__text">
                        {status === 'upcoming' && 'Голосование скоро'}
                        {status === 'active' && 'Голосование идёт'}
                        {status === 'finished' && 'Голосование завершено'}
                    </span>
                    <span className="admin-status__meta">
                        {status === 'upcoming' && `старт через ${formatDuration(voting.startsAt - now)}`}
                        {status === 'active' && `до конца ${formatDuration(voting.endsAt - now)}`}
                        {status === 'finished' && new Date(voting.endsAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </Link>
            </header>

            <section className="admin-stats">
                <article className="admin-card admin-stat admin-stat--live">
                    <span className="admin-stat__label">
                        <span className="admin-stat__pulse" />
                        Онлайн сейчас
                    </span>
                    <span className="admin-stat__value" key={online.length}>{online.length}</span>
                    <div className="admin-stat__avatars">
                        {online.slice(0, 6).map((id) => {
                            const user = findUser(id);
                            return (
                                <span className="admin-stat__avatar" key={id} title={user?.name}>{initials(user?.name ?? '')}</span>
                            );
                        })}
                        {online.length > 6 && <span className="admin-stat__avatar admin-stat__avatar--more">+{online.length - 6}</span>}
                    </div>
                </article>

                <article className="admin-card admin-stat">
                    <span className="admin-stat__label">Всего заходили</span>
                    <span className="admin-stat__value">{stats.totalUsers}</span>
                    <span className="admin-stat__hint"><em>+{stats.newToday}</em> сегодня</span>
                </article>

                <article className="admin-card admin-stat">
                    <span className="admin-stat__label">Проголосовали</span>
                    <span className="admin-stat__value">
                        {stats.votedUsers}
                        <span className="admin-stat__value-part">/ {stats.totalUsers}</span>
                    </span>
                    <div className="admin-meter" style={{ '--value': `${votedPercent}%`, '--extra': `${completedPercent}%` }}>
                        <span className="admin-meter__fill" />
                        <span className="admin-meter__fill admin-meter__fill--strong" />
                    </div>
                    <span className="admin-stat__hint"><em>{votedPercent}%</em> заходивших · {stats.completedUsers} прошли всё</span>
                </article>

                <article className="admin-card admin-stat">
                    <span className="admin-stat__label">Голосов отдано</span>
                    <span className="admin-stat__value" key={stats.totalVotes}>{stats.totalVotes}</span>
                    <span className="admin-stat__hint"><em>+{stats.votesToday}</em> сегодня</span>
                </article>
            </section>

            <section className="admin-dashboard__grid">
                <article className="admin-card admin-chart">
                    <header className="admin-card__header">
                        <h2 className="admin-card__title">Голоса по дням</h2>
                        <span className="admin-card__meta">
                            {status === 'active' && `день ${todayIndex + 1} из ${totalDays}`}
                            {status === 'upcoming' && `${totalDays} ${plural(totalDays, 'день', 'дня', 'дней')}, старт через ${formatDuration(voting.startsAt - now)}`}
                            {status === 'finished' && `все ${totalDays} ${plural(totalDays, 'день', 'дня', 'дней')}`}
                        </span>
                    </header>

                    <div className={`admin-chart__bars${isDense ? ' is-dense' : ''}`} style={{ '--days': totalDays }}>
                        {days.map((day, index) => (
                            <div
                                className={`admin-chart__bar is-${day.state}`}
                                key={day.date.toISOString()}
                                style={{ '--height': `${((day.votes ?? 0) / maxDayVotes) * 100}%`, '--i': index }}
                            >
                                <span className="admin-chart__value">{day.state === 'future' ? '—' : day.votes}</span>
                                <span className="admin-chart__column" />
                                <span className="admin-chart__day">
                                    <span className="admin-chart__day-number">{isDense ? index + 1 : `День ${index + 1}`}</span>
                                    {!isDense && (day.state === 'today' ? 'сегодня' : formatDay(day.date))}
                                </span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-card admin-feed">
                    <header className="admin-card__header">
                        <h2 className="admin-card__title">Последние события</h2>
                        <span className="admin-card__meta admin-card__meta--live">в реальном времени</span>
                    </header>

                    <ul className="admin-feed__list">
                        {events.map((event) => (
                            <li className={`admin-feed__item admin-feed__item--${event.type}`} key={event.id}>
                                <span className="admin-feed__marker" />
                                <span className="admin-feed__text"><EventText event={event} /></span>
                                <time className="admin-feed__time">{formatAgo(event.at, now)}</time>
                            </li>
                        ))}
                    </ul>
                </article>
            </section>

            <section className="admin-card admin-turnout">
                <header className="admin-card__header">
                    <h2 className="admin-card__title">Явка по номинациям</h2>
                    <span className="admin-card__meta">голосов из {stats.totalUsers} возможных</span>
                </header>

                <ul className="admin-turnout__list">
                    {sortedTurnout.map((item, index) => {
                        const value = percent(item.votes, stats.totalUsers);
                        const filled = Math.round(value / 5);
                        return (
                            <li className="admin-turnout__row" key={item.number} style={{ '--i': index }}>
                                <span className="admin-turnout__title">{item.title}</span>
                                <span className="admin-turnout__segments" aria-hidden="true">
                                    {Array.from({ length: 20 }, (_, segment) => (
                                        <span className={`admin-turnout__segment${segment < filled ? ' is-filled' : ''}`} key={segment} />
                                    ))}
                                </span>
                                <span className="admin-turnout__value">
                                    {item.votes}
                                    <span className="admin-turnout__percent">{value}%</span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}
