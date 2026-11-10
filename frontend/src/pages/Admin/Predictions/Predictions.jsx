import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPredictionRating, getVotingStatus, notify, plural, useAdminStore } from '../store.js';
import { UserAvatar } from '../Users/UsersList.jsx';

const pointsLabel = (value) => `${value} ${plural(value, 'очко', 'очка', 'очков')}`;

const toText = (rows, total) => [
    'Рейтинг прогнозов FLAY 2026',
    '',
    ...rows.map((row) => `${row.place}. ${row.user.name} — ${row.points} из ${total}`),
].join('\n');

export default function Predictions() {
    const nominations = useAdminStore((state) => state.nominations);
    const users = useAdminStore((state) => state.users);
    const voting = useAdminStore((state) => state.voting);
    const [openId, setOpenId] = useState(null);

    const rows = getPredictionRating(nominations, users);
    const total = nominations.length;
    const isFinal = getVotingStatus(voting) === 'finished';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(toText(rows, total));
            notify('Рейтинг скопирован');
        } catch {
            notify('Не получилось скопировать', 'error');
        }
    };

    return (
        <div className="admin-forecast">
            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">FLAY 2026</span>
                    <h1 className="admin-page__title">
                        Прогнозы
                        <sup className="admin-page__count">{rows.length}</sup>
                    </h1>
                </div>

                {rows.length > 0 && (
                    <button type="button" className="admin-button admin-button--outline" onClick={copy}>Скопировать рейтинг</button>
                )}
            </header>

            <p className={`admin-forecast__note${isFinal ? ' is-final' : ''}`}>
                {isFinal
                    ? 'Голосование завершено, очки окончательные. Одно попадание в победителя номинации — одно очко, при равенстве голосов засчитываются оба лидера.'
                    : 'Голосование ещё не завершено: очки посчитаны по текущим голосам и будут меняться. Участники этот рейтинг не видят.'}
            </p>

            <div className="admin-card admin-forecast__card">
                {rows.length === 0 ? (
                    <div className="admin-empty">
                        <span className="admin-empty__title">Прогнозов пока нет</span>
                        <span className="admin-empty__text">Здесь появятся участники, которые сделали хотя бы один прогноз.</span>
                    </div>
                ) : (
                    <ul className="admin-forecast__list">
                        {rows.map((row) => {
                            const isOpen = openId === row.user.id;

                            return (
                                <li className={`admin-forecast__item${isOpen ? ' is-open' : ''}`} key={row.user.id}>
                                    <button type="button" className="admin-forecast__row" onClick={() => setOpenId(isOpen ? null : row.user.id)} aria-expanded={isOpen}>
                                        <span className={`admin-forecast__place${row.place <= 3 ? ' is-top' : ''}`}>{row.place}</span>
                                        <UserAvatar user={row.user} />
                                        <span className="admin-forecast__identity">
                                            <span className="admin-forecast__name">{row.user.name}</span>
                                            <span className="admin-forecast__handle">{row.user.handle}</span>
                                        </span>
                                        <span className="admin-forecast__made">{row.picks.length}/{total} прогнозов</span>
                                        <span className="admin-forecast__points">{pointsLabel(row.points)}</span>
                                        <svg className="admin-forecast__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>

                                    {isOpen && (
                                        <div className="admin-forecast__details">
                                            <ul className="admin-forecast__picks">
                                                {row.picks.map((pick) => (
                                                    <li className={`admin-forecast__pick is-${pick.result}`} key={pick.nominationId}>
                                                        <span className="admin-forecast__pick-nomination">{pick.nomination}</span>
                                                        <span className="admin-forecast__pick-name">{pick.candidate}</span>
                                                        <span className="admin-forecast__pick-result">
                                                            {pick.result === 'hit' && 'угадал'}
                                                            {pick.result === 'miss' && `мимо · лидер: ${pick.winners.join(', ')}`}
                                                            {pick.result === 'open' && 'голосов ещё нет'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Link to={`/admin/users/${row.user.id}`} className="admin-forecast__profile">Профиль участника</Link>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
