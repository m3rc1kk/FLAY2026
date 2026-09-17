import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
    BAN_REASONS,
    banUser,
    fetchUserEvents,
    getUserVotes,
    isOnline,
    notify,
    plural,
    removeUserVote,
    resetUserVotes,
    unbanUser,
    useAdminStore,
    votesLabel,
} from '../store.js';
import { formatAgo, formatDate, UserAvatar } from './UsersList.jsx';

function Moderation({ user, votesCount }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState(BAN_REASONS[0]);
    const [custom, setCustom] = useState('');
    const [withVotes, setWithVotes] = useState(true);
    const [isConfirmingReset, setIsConfirmingReset] = useState(false);

    const finalReason = reason === 'other' ? custom.trim() : reason;

    const ban = async (event) => {
        event.preventDefault();
        if (!finalReason) return;
        setIsOpen(false);
        if (await banUser(user.id, finalReason, withVotes)) notify(`Аккаунт заблокирован: ${user.name}`);
    };

    const unban = async () => {
        if (await unbanUser(user.id)) notify(`Блокировка снята: ${user.name}`);
    };

    const reset = async () => {
        setIsConfirmingReset(false);
        if (await resetUserVotes(user.id)) notify(`Голоса сброшены: ${user.name}`);
    };

    if (user.status === 'banned') {
        return (
            <section className="admin-card admin-moderation admin-moderation--banned">
                <header className="admin-card__header">
                    <h2 className="admin-card__title">Аккаунт заблокирован</h2>
                    <span className="admin-card__meta">{formatDate(user.bannedAt)}</span>
                </header>
                <p className="admin-moderation__reason">
                    <span className="admin-moderation__label">Причина</span>
                    {user.banReason}
                </p>
                <p className="admin-moderation__note">Не может голосовать. Если голоса не удаляли при блокировке, они не учитываются в результатах.</p>
                <button type="button" className="admin-button admin-button--outline" onClick={unban}>Разблокировать</button>
            </section>
        );
    }

    return (
        <section className="admin-card admin-moderation">
            <header className="admin-card__header">
                <h2 className="admin-card__title">Модерация</h2>
            </header>

            {isOpen ? (
                <form className="admin-ban-form" onSubmit={ban}>
                    <span className="admin-field__label">Причина блокировки</span>
                    <div className="admin-chips">
                        {BAN_REASONS.map((item) => (
                            <button type="button" key={item} className={`admin-chips__chip${reason === item ? ' is-active' : ''}`} onClick={() => setReason(item)}>{item}</button>
                        ))}
                        <button type="button" className={`admin-chips__chip${reason === 'other' ? ' is-active' : ''}`} onClick={() => setReason('other')}>Другое</button>
                    </div>

                    {reason === 'other' && (
                        <input className="admin-field__input" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Опиши причину" autoFocus />
                    )}

                    <label className="admin-checkbox">
                        <input type="checkbox" checked={withVotes} onChange={(event) => setWithVotes(event.target.checked)} />
                        <span className="admin-checkbox__box" />
                        <span className="admin-checkbox__text">
                            Удалить голоса пользователя
                            <span className="admin-checkbox__hint">{votesCount ? votesLabel(votesCount) : 'голосов нет'}</span>
                        </span>
                    </label>

                    <div className="admin-form__actions">
                        <button type="submit" className="admin-button admin-button--danger" disabled={!finalReason}>Заблокировать</button>
                        <button type="button" className="admin-button admin-button--ghost" onClick={() => setIsOpen(false)}>Отмена</button>
                    </div>
                </form>
            ) : (
                <div className="admin-moderation__actions">
                    <div className="admin-moderation__action">
                        <span className="admin-moderation__text">
                            <span className="admin-moderation__title">Заблокировать</span>
                            <span className="admin-moderation__description">Не сможет голосовать и заходить в голосование.</span>
                        </span>
                        <button type="button" className="admin-button admin-button--danger-outline" onClick={() => setIsOpen(true)}>Заблокировать</button>
                    </div>

                    <div className="admin-moderation__action">
                        <span className="admin-moderation__text">
                            <span className="admin-moderation__title">Сбросить все голоса</span>
                            <span className="admin-moderation__description">
                                {votesCount ? `Удалятся ${votesLabel(votesCount)}, голосовать можно будет заново.` : 'Сбрасывать нечего, голосов нет.'}
                            </span>
                        </span>
                        {isConfirmingReset ? (
                            <span className="admin-danger__actions">
                                <button type="button" className="admin-button admin-button--danger admin-button--small" onClick={reset}>Сбросить</button>
                                <button type="button" className="admin-button admin-button--ghost admin-button--small" onClick={() => setIsConfirmingReset(false)}>Отмена</button>
                            </span>
                        ) : (
                            <button type="button" className="admin-button admin-button--ghost" onClick={() => setIsConfirmingReset(true)} disabled={!votesCount}>Сбросить</button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

export default function UserDetail() {
    const { id } = useParams();
    const users = useAdminStore((state) => state.users);
    const nominations = useAdminStore((state) => state.nominations);
    const [confirmNomination, setConfirmNomination] = useState(null);
    const [events, setEvents] = useState([]);

    const user = users.find((item) => item.id === Number(id));
    const votesSignature = user ? getUserVotes(nominations, user.id).map((item) => item.vote?.id ?? 0).join() : '';

    const userId = user?.id;
    const historySignature = `${user?.status}-${user?.revokes}-${votesSignature}`;

    useEffect(() => {
        if (!userId) return;
        let isActive = true;
        fetchUserEvents(userId).then((items) => isActive && setEvents(items)).catch(() => null);
        return () => {
            isActive = false;
        };
    }, [userId, historySignature]);

    if (!user) return <Navigate to="/admin/users" replace />;

    const votes = getUserVotes(nominations, user.id);
    const done = votes.filter((item) => item.vote);
    const selfVote = done.find((item) => item.candidate?.name === user.name);
    const online = isOnline(user);

    const history = events.map((event) => ({
        id: event.id,
        type: event.type,
        at: event.at,
        text: {
            join: 'Первый вход на сайт',
            vote: <>Голос в «{event.nomination ?? 'удалённая номинация'}»{event.nominee && <> за <em>{event.nominee}</em></>}</>,
            revoke: `Отмена голоса в «${event.nomination ?? 'удалённая номинация'}»`,
            ban: `Блокировка: ${event.reason}`,
            unban: 'Блокировка снята',
        }[event.type],
    }));

    const removeVote = async (item) => {
        setConfirmNomination(null);
        if (await removeUserVote(user.id, item.nomination.id)) notify(`Голос в «${item.nomination.title}» сброшен`);
    };

    return (
        <div className="admin-user">
            <Link to="/admin/users" className="admin-back">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Все пользователи
            </Link>

            <header className="admin-user__header">
                <UserAvatar user={user} size="xl" />

                <div className="admin-page__heading">
                    <span className={`admin-user__presence${online ? ' is-online' : ''}`}>
                        {user.status === 'banned' ? 'Аккаунт заблокирован' : online ? 'Онлайн' : `Активность ${formatAgo(user.lastSeenAt)}`}
                    </span>
                    <h1 className="admin-page__title admin-page__title--wrap">{user.name}</h1>
                    {user.username ? (
                        <a href={`https://t.me/${user.username}`} target="_blank" rel="noopener noreferrer" className="admin-user__username">
                            @{user.username} · ID {user.telegramId}
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    ) : (
                        <span className="admin-user__username">ID {user.telegramId}</span>
                    )}
                </div>
            </header>

            {(selfVote || user.revokes >= 3 || !user.isAllowed) && (
                <div className="admin-flags">
                    {!user.isAllowed && (
                        <span className="admin-flag">
                            <span className="admin-flag__icon">!</span>
                            Нет в списке доступа, голосовать не может
                        </span>
                    )}
                    {selfVote && (
                        <span className="admin-flag">
                            <span className="admin-flag__icon">!</span>
                            Голос за себя в «{selfVote.nomination.title}»
                        </span>
                    )}
                    {user.revokes >= 3 && (
                        <span className="admin-flag">
                            <span className="admin-flag__icon">!</span>
                            Часто меняет голос: {user.revokes} {plural(user.revokes, 'отмена', 'отмены', 'отмен')}
                        </span>
                    )}
                </div>
            )}

            <section className="admin-user__stats">
                <article className="admin-card admin-mini-stat">
                    <span className="admin-mini-stat__label">Голосов</span>
                    <span className="admin-mini-stat__value">
                        {done.length}
                        <span className="admin-mini-stat__of">/{votes.length}</span>
                    </span>
                    <span className="admin-steps admin-steps--wide" aria-hidden="true">
                        {votes.map((item) => <span className={`admin-steps__step${item.vote ? ' is-done' : ''}`} key={item.nomination.id} />)}
                    </span>
                </article>
                <article className="admin-card admin-mini-stat">
                    <span className="admin-mini-stat__label">Отмен голоса</span>
                    <span className="admin-mini-stat__value">{user.revokes}</span>
                    <span className="admin-mini-stat__hint">{user.revokes ? 'смена выбора в номинациях' : 'выбор не менялся'}</span>
                </article>
                <article className="admin-card admin-mini-stat">
                    <span className="admin-mini-stat__label">Первый вход</span>
                    <span className="admin-mini-stat__text">{formatDate(user.joinedAt)}</span>
                    <span className="admin-mini-stat__hint">{formatAgo(user.joinedAt)}</span>
                </article>
                <article className="admin-card admin-mini-stat">
                    <span className="admin-mini-stat__label">Последняя активность</span>
                    <span className={`admin-mini-stat__text${online ? ' is-online' : ''}`}>{online ? 'Сейчас на сайте' : formatDate(user.lastSeenAt)}</span>
                    <span className="admin-mini-stat__hint">{online ? 'активен прямо сейчас' : formatAgo(user.lastSeenAt)}</span>
                </article>
            </section>

            <div className="admin-user__grid">
                <section className="admin-card admin-ballot">
                    <header className="admin-card__header">
                        <h2 className="admin-card__title">Голоса по номинациям</h2>
                        <span className="admin-card__meta">{done.length} из {votes.length}</span>
                    </header>

                    <ul className="admin-ballot__list">
                        {votes.map((item) => {
                            const isConfirming = confirmNomination === item.nomination.id;
                            return (
                                <li className={`admin-ballot__row${item.vote ? ' is-done' : ''}`} key={item.nomination.id}>
                                    <span className="admin-ballot__check" aria-hidden="true">
                                        {item.vote && (
                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
                                                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </span>

                                    <Link to={`/admin/nominations/${item.nomination.id}`} className="admin-ballot__nomination">{item.nomination.title}</Link>

                                    {item.vote ? (
                                        isConfirming ? (
                                            <span className="admin-ballot__confirm">
                                                <button type="button" className="admin-button admin-button--danger admin-button--small" onClick={() => removeVote(item)}>Сбросить</button>
                                                <button type="button" className="admin-button admin-button--ghost admin-button--small" onClick={() => setConfirmNomination(null)}>Отмена</button>
                                            </span>
                                        ) : (
                                            <>
                                                <span className="admin-ballot__candidate">
                                                    {item.candidate?.name}
                                                    <span className="admin-ballot__time">{formatAgo(item.vote.at)}</span>
                                                </span>
                                                <button type="button" className="admin-icon-button" onClick={() => setConfirmNomination(item.nomination.id)} aria-label={`Сбросить голос в ${item.nomination.title}`} title="Сбросить голос">
                                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                                        <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </>
                                        )
                                    ) : (
                                        <span className="admin-ballot__empty">голоса нет</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <div className="admin-user__side">
                    <Moderation key={`${user.id}-${user.status}`} user={user} votesCount={done.length} />

                    <section className="admin-card admin-history">
                        <header className="admin-card__header">
                            <h2 className="admin-card__title">История</h2>
                        </header>
                        <ol className="admin-history__list">
                            {history.map((event) => (
                                <li className={`admin-history__item admin-history__item--${event.type}`} key={event.id}>
                                    <span className="admin-history__dot" />
                                    <span className="admin-history__text">{event.text}</span>
                                    <time className="admin-history__time">{formatAgo(event.at)}</time>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </div>
        </div>
    );
}
