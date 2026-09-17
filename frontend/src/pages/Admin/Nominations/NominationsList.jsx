import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addNomination, getResults, moveNomination, notify, TOTAL_USERS_SELECTOR, useAdminStore } from '../store.js';
import { CandidatePhoto } from '../ui.jsx';

export default function NominationsList() {
    const navigate = useNavigate();
    const nominations = useAdminStore((state) => state.nominations);
    const totalUsers = useAdminStore(TOTAL_USERS_SELECTOR);
    const [query, setQuery] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const isFiltered = query.trim() !== '';

    const rows = nominations
        .map((nomination, index) => ({ nomination, index }))
        .filter(({ nomination }) => nomination.title.toLowerCase().includes(query.trim().toLowerCase()));

    const handleAdd = async () => {
        const created = await addNomination();
        if (!created) return;
        notify('Номинация создана');
        navigate(`/admin/nominations/${created.id}`);
    };

    const handleDrop = (index) => {
        if (dragIndex !== null && dragIndex !== index) {
            moveNomination(dragIndex, index).then((result) => result && notify('Порядок на сайте обновлён'));
        }
        setDragIndex(null);
        setOverIndex(null);
    };

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= nominations.length) return;
        moveNomination(index, target);
    };

    return (
        <div className="admin-nominations">
            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">FLAY 2026</span>
                    <h1 className="admin-page__title">
                        Номинации
                        <sup className="admin-page__count">{String(nominations.length).padStart(2, '0')}</sup>
                    </h1>
                </div>

                <button type="button" className="admin-button" onClick={handleAdd}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    Добавить номинацию
                </button>
            </header>

            <div className="admin-toolbar">
                <span className="admin-toolbar__hint">Порядок здесь = порядок на сайте. Перетаскивай строки за ручку.</span>

                <label className="admin-search">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                        <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm5-2 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти номинацию" className="admin-search__input" />
                </label>
            </div>

            <div className="admin-card admin-table">
                <div className="admin-table__head" aria-hidden="true">
                    <span />
                    <span>Номинация</span>
                    <span>Кандидаты</span>
                    <span>Явка</span>
                    <span>Лидер</span>
                </div>

                {rows.length === 0 && (
                    <div className="admin-empty">
                        <span className="admin-empty__title">Ничего не нашлось</span>
                        <span className="admin-empty__text">Попробуй другое название.</span>
                    </div>
                )}

                <ol className="admin-table__body">
                    {rows.map(({ nomination, index }, rowIndex) => {
                        const results = getResults(nomination);
                        const leader = results[0];
                        const second = results[1];
                        const turnout = totalUsers ? Math.round((nomination.votes.length / totalUsers) * 100) : 0;
                        const isTie = leader && second && leader.votes === second.votes && leader.votes > 0;

                        return (
                            <li
                                key={nomination.id}
                                className={`admin-table__row${dragIndex === index ? ' is-dragging' : ''}${overIndex === index && dragIndex !== index ? ' is-over' : ''}`}
                                style={{ '--i': rowIndex }}
                                draggable={!isFiltered}
                                onDragStart={() => setDragIndex(index)}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setOverIndex(index);
                                }}
                                onDragEnd={() => {
                                    setDragIndex(null);
                                    setOverIndex(null);
                                }}
                                onDrop={() => handleDrop(index)}
                            >
                                <span className="admin-table__order">
                                    <span className={`admin-table__handle${isFiltered ? ' is-disabled' : ''}`} title={isFiltered ? 'Очисти поиск, чтобы менять порядок' : 'Перетащи, чтобы изменить порядок'}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                                            <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
                                        </svg>
                                    </span>
                                    <span className="admin-table__index">{String(index + 1).padStart(2, '0')}</span>
                                    <span className="admin-table__move">
                                        <button type="button" onClick={() => move(index, -1)} disabled={isFiltered || index === 0} aria-label="Выше">↑</button>
                                        <button type="button" onClick={() => move(index, 1)} disabled={isFiltered || index === nominations.length - 1} aria-label="Ниже">↓</button>
                                    </span>
                                </span>

                                <Link to={`/admin/nominations/${nomination.id}`} className="admin-table__title">
                                    {nomination.title}
                                    <svg className="admin-table__arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>

                                <span className="admin-table__candidates">
                                    <span className="admin-avatars">
                                        {nomination.candidates.slice(0, 4).map((candidate) => (
                                            <CandidatePhoto candidate={candidate} className="admin-avatars__item" key={candidate.id} />
                                        ))}
                                    </span>
                                    <span className="admin-table__muted">{nomination.candidates.length || 'нет'}</span>
                                </span>

                                <span className="admin-table__turnout">
                                    <span className="admin-mini-meter" style={{ '--value': `${turnout}%` }} />
                                    <span className="admin-table__number">{nomination.votes.length}</span>
                                    <span className="admin-table__muted">{turnout}%</span>
                                </span>

                                <span className="admin-table__leader">
                                    {leader && leader.votes > 0 ? (
                                        <>
                                            <span className="admin-table__leader-name">{isTie ? 'Ничья' : leader.name}</span>
                                            <span className="admin-table__muted">
                                                {isTie ? `${leader.name.split(' ')[0]} и ${second.name.split(' ')[0]} по ${leader.votes}` : `+${leader.votes - (second?.votes ?? 0)} от второго`}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="admin-table__muted">Голосов пока нет</span>
                                    )}
                                </span>

                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}
