import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
    addCandidate,
    findVoter,
    getResults,
    moveCandidate,
    notify,
    plural,
    removeCandidate,
    removeNomination,
    setCandidatePhoto,
    TOTAL_USERS_SELECTOR,
    updateNomination,
    useAdminStore,
    votesLabel,
} from '../store.js';
import { initials, PhotoDrop } from '../ui.jsx';

const pad = (value) => String(value).padStart(2, '0');

const formatAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    return new Date(timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

function MainForm({ nomination }) {
    const [title, setTitle] = useState(nomination.title);
    const [description, setDescription] = useState(nomination.description);

    const isDirty = title !== nomination.title || description !== nomination.description;
    const isValid = title.trim().length > 0;

    const save = async (event) => {
        event.preventDefault();
        if (!isDirty || !isValid) return;
        if (await updateNomination(nomination.id, { title: title.trim().toUpperCase(), description: description.trim() })) {
            notify('Изменения сохранены');
        }
    };

    const reset = () => {
        setTitle(nomination.title);
        setDescription(nomination.description);
    };

    return (
        <form className="admin-card admin-form" onSubmit={save}>
            <header className="admin-card__header">
                <h2 className="admin-card__title">Основное</h2>
                {isDirty && <span className="admin-card__meta admin-form__dirty">Есть несохранённые изменения</span>}
            </header>

            <label className="admin-field">
                <span className="admin-field__label">Название</span>
                <input className="admin-field__input admin-field__input--title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={40} />
                {!isValid && <span className="admin-field__error">Название не может быть пустым</span>}
            </label>

            <label className="admin-field">
                <span className="admin-field__label">
                    Описание
                    <span className="admin-field__optional">необязательно</span>
                </span>
                <textarea className="admin-field__input admin-field__textarea" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Кого номинируем и за что" />
            </label>

            <div className="admin-form__actions">
                <button type="submit" className="admin-button" disabled={!isDirty || !isValid}>Сохранить изменения</button>
                {isDirty && <button type="button" className="admin-button admin-button--ghost" onClick={reset}>Отменить</button>}
            </div>
        </form>
    );
}

function Candidates({ nomination, results }) {
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const votesById = Object.fromEntries(results.map((item) => [item.id, item.votes]));

    useEffect(() => () => {
        if (photo) URL.revokeObjectURL(photo.url);
    }, [photo]);

    const choosePhoto = (file) => setPhoto(file ? { file, url: URL.createObjectURL(file) } : null);

    const add = async (event) => {
        event.preventDefault();
        const value = name.trim();
        if (!value || isAdding) return;
        setIsAdding(true);
        const result = await addCandidate(nomination.id, value, photo?.file);
        setIsAdding(false);
        if (!result) return;
        setName('');
        choosePhoto(null);
        notify(`Кандидат добавлен: ${value}`);
    };

    const remove = async (candidate) => {
        setConfirmId(null);
        if (await removeCandidate(candidate.id)) notify(`Кандидат удалён: ${candidate.name}`);
    };

    const drop = (index) => {
        if (dragIndex !== null && dragIndex !== index) moveCandidate(nomination.id, dragIndex, index);
        setDragIndex(null);
        setOverIndex(null);
    };

    return (
        <section className="admin-card admin-candidates">
            <header className="admin-card__header">
                <h2 className="admin-card__title">
                    Кандидаты
                    <span className="admin-card__count">{nomination.candidates.length}</span>
                </h2>
                <span className="admin-card__meta">порядок как на сайте</span>
            </header>

            {nomination.candidates.length === 0 ? (
                <div className="admin-empty admin-empty--compact">
                    <span className="admin-empty__title">Кандидатов пока нет</span>
                    <span className="admin-empty__text">Добавь первого кандидата ниже.</span>
                </div>
            ) : (
                <ul className="admin-candidates__list">
                    {nomination.candidates.map((candidate, index) => {
                        const votes = votesById[candidate.id] ?? 0;
                        const isConfirming = confirmId === candidate.id;

                        return (
                            <li
                                key={candidate.id}
                                className={`admin-candidates__item${dragIndex === index ? ' is-dragging' : ''}${overIndex === index && dragIndex !== index ? ' is-over' : ''}${isConfirming ? ' is-confirming' : ''}`}
                                draggable={!isConfirming}
                                onDragStart={() => setDragIndex(index)}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setOverIndex(index);
                                }}
                                onDragEnd={() => {
                                    setDragIndex(null);
                                    setOverIndex(null);
                                }}
                                onDrop={() => drop(index)}
                            >
                                <span className="admin-table__handle" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
                                    </svg>
                                </span>

                                <PhotoDrop
                                    photo={candidate.photo}
                                    name={candidate.name}
                                    className="admin-candidates__photo"
                                    changeLabel=""
                                    emptyLabel=""
                                    onChange={async (file) => {
                                        if (await setCandidatePhoto(candidate.id, file)) notify(`Фото обновлено: ${candidate.name}`);
                                    }}
                                    onError={(text) => notify(text, 'error')}
                                />

                                {isConfirming ? (
                                    <>
                                        <span className="admin-candidates__confirm">
                                            {votes > 0 ? `Удалить вместе с ${votes} ${plural(votes, 'голосом', 'голосами', 'голосами')}?` : 'Удалить кандидата?'}
                                        </span>
                                        <span className="admin-candidates__actions">
                                            <button type="button" className="admin-button admin-button--danger admin-button--small" onClick={() => remove(candidate)}>Удалить</button>
                                            <button type="button" className="admin-button admin-button--ghost admin-button--small" onClick={() => setConfirmId(null)}>Отмена</button>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="admin-candidates__text">
                                            <span className="admin-candidates__name">{candidate.name}</span>
                                            <span className="admin-candidates__meta">кандидат {pad(index + 1)} · {votesLabel(votes)}</span>
                                        </span>
                                        <button type="button" className="admin-icon-button" onClick={() => setConfirmId(candidate.id)} aria-label={`Удалить ${candidate.name}`}>
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            <form className="admin-new-candidate" onSubmit={add}>
                <span className="admin-new-candidate__photo-wrap">
                    <PhotoDrop
                        photo={photo?.url}
                        className="admin-new-candidate__photo"
                        emptyLabel="Фото"
                        onChange={choosePhoto}
                        onError={(text) => notify(text, 'error')}
                    />
                    {photo && (
                        <button type="button" className="admin-new-candidate__clear" onClick={() => choosePhoto(null)} aria-label="Убрать фото">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </span>

                <span className="admin-new-candidate__body">
                    <span className="admin-field__label">Новый кандидат</span>
                    <input className="admin-field__input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя и фамилия" />
                    <span className="admin-new-candidate__hint">Фото можно перетащить на рамку слева. JPG, PNG или WebP до 5 МБ.</span>
                </span>

                <button type="submit" className="admin-button admin-button--outline admin-new-candidate__submit" disabled={!name.trim() || isAdding}>{isAdding ? 'Добавляем' : 'Добавить'}</button>
            </form>
        </section>
    );
}

function Results({ nomination, results }) {
    const totalUsers = useAdminStore(TOTAL_USERS_SELECTOR);
    const total = nomination.votes.length;
    const turnout = totalUsers ? Math.round((total / totalUsers) * 100) : 0;
    const leader = results[0];
    const isTie = results[1] && leader.votes === results[1].votes && leader.votes > 0;

    return (
        <section className="admin-card admin-results">
            <header className="admin-card__header">
                <h2 className="admin-card__title">Результаты</h2>
                <span className="admin-card__meta">{votesLabel(total)} · явка {turnout}%</span>
            </header>

            {total === 0 ? (
                <div className="admin-empty admin-empty--compact">
                    <span className="admin-empty__title">Голосов пока нет</span>
                    <span className="admin-empty__text">
                        Результаты появятся после первого голоса.
                    </span>
                </div>
            ) : (
                <ol className="admin-results__list">
                    {results.map((item, index) => {
                        const isLeader = index === 0 && item.votes > 0 && !isTie;
                        const isTied = isTie && item.votes === leader.votes;
                        return (
                            <li className={`admin-results__row${isLeader ? ' is-leader' : ''}${isTied ? ' is-tied' : ''}`} key={item.id} style={{ '--share': `${Math.max(item.share * 100, 1)}%`, '--i': index }}>
                                <span className="admin-results__place">{index + 1}</span>
                                <span className="admin-results__body">
                                    <span className="admin-results__top">
                                        <span className="admin-results__name">{item.name}</span>
                                        {isLeader && <span className="admin-results__tag">лидирует</span>}
                                        {isTied && <span className="admin-results__tag admin-results__tag--tie">ничья</span>}
                                        <span className="admin-results__value">
                                            {item.votes}
                                            <span className="admin-results__percent">{Math.round(item.share * 100)}%</span>
                                        </span>
                                    </span>
                                    <span className="admin-results__bar" />
                                </span>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}

function Votes({ nomination }) {
    const [candidateId, setCandidateId] = useState('all');
    const [limit, setLimit] = useState(8);

    const candidatesById = Object.fromEntries(nomination.candidates.map((candidate) => [candidate.id, candidate]));
    const filtered = nomination.votes.filter((vote) => candidateId === 'all' || vote.candidateId === candidateId);

    return (
        <section className="admin-card admin-votes">
            <header className="admin-card__header">
                <h2 className="admin-card__title">
                    Голоса
                    <span className="admin-card__count">{nomination.votes.length}</span>
                </h2>
            </header>

            {nomination.votes.length > 0 && (
                <div className="admin-chips">
                    <button type="button" className={`admin-chips__chip${candidateId === 'all' ? ' is-active' : ''}`} onClick={() => setCandidateId('all')}>Все</button>
                    {nomination.candidates.map((candidate) => (
                        <button type="button" key={candidate.id} className={`admin-chips__chip${candidateId === candidate.id ? ' is-active' : ''}`} onClick={() => setCandidateId(candidate.id)}>
                            {candidate.name.split(' ').map((part, position) => (position === 0 ? part : `${part[0]}.`)).join(' ')}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="admin-empty admin-empty--compact">
                    <span className="admin-empty__title">Голосов нет</span>
                    <span className="admin-empty__text">{nomination.votes.length ? 'За этого кандидата пока не голосовали.' : 'Здесь появится, кто и за кого проголосовал.'}</span>
                </div>
            ) : (
                <ul className="admin-votes__list">
                    {filtered.slice(0, limit).map((vote) => {
                        const voter = findVoter(vote.userId);
                        return (
                            <li className="admin-votes__item" key={vote.id}>
                                <span className="admin-votes__avatar">{initials(voter?.name ?? '')}</span>
                                <span className="admin-votes__who">
                                    <Link to={`/admin/users/${vote.userId}`} className="admin-votes__name">{voter?.name}</Link>
                                    <span className="admin-votes__username">{voter?.handle}</span>
                                </span>
                                <span className="admin-votes__target">{candidatesById[vote.candidateId]?.name}</span>
                                <time className="admin-votes__time">{formatAgo(vote.at)}</time>
                            </li>
                        );
                    })}
                </ul>
            )}

            {filtered.length > limit && (
                <button type="button" className="admin-button admin-button--ghost admin-votes__more" onClick={() => setLimit((current) => current + 12)}>
                    Показать ещё {Math.min(12, filtered.length - limit)}
                </button>
            )}
        </section>
    );
}

export default function NominationEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const nominations = useAdminStore((state) => state.nominations);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const index = nominations.findIndex((item) => item.id === Number(id));
    const nomination = nominations[index];

    if (!nomination) return <Navigate to="/admin/nominations" replace />;

    const results = getResults(nomination);

    const deleteNomination = async () => {
        const { title } = nomination;
        setIsConfirmingDelete(false);
        if (!(await removeNomination(nomination.id))) return;
        notify(`Номинация «${title}» удалена`);
        navigate('/admin/nominations', { replace: true });
    };

    return (
        <div className="admin-nomination">
            <Link to="/admin/nominations" className="admin-back">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Все номинации
            </Link>

            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">Номинация {pad(index + 1)} из {pad(nominations.length)}</span>
                    <h1 className="admin-page__title admin-page__title--wrap">{nomination.title}</h1>
                </div>

                <div className="admin-nomination__header-side">
                    <a href={`/nominations/${nomination.id}`} target="_blank" rel="noopener noreferrer" className="admin-button admin-button--ghost">
                        На сайте
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                            <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
            </header>

            <div className="admin-nomination__grid">
                <div className="admin-nomination__column">
                    <MainForm key={`${nomination.id}-${nomination.title}-${nomination.description}`} nomination={nomination} />
                    <Candidates nomination={nomination} results={results} />
                </div>

                <div className="admin-nomination__column">
                    <Results nomination={nomination} results={results} />
                    <Votes key={nomination.id} nomination={nomination} />
                </div>
            </div>

            <section className="admin-danger">
                <span className="admin-danger__text">
                    <span className="admin-danger__title">Удалить номинацию</span>
                    <span className="admin-danger__description">
                        {nomination.votes.length > 0 ? `Вместе с ней удалятся ${votesLabel(nomination.votes.length)}. Это нельзя отменить.` : 'Номинация исчезнет из списка и с сайта.'}
                    </span>
                </span>

                {isConfirmingDelete ? (
                    <span className="admin-danger__actions">
                        <button type="button" className="admin-button admin-button--danger" onClick={deleteNomination}>Да, удалить</button>
                        <button type="button" className="admin-button admin-button--ghost" onClick={() => setIsConfirmingDelete(false)}>Отмена</button>
                    </span>
                ) : (
                    <button type="button" className="admin-button admin-button--danger-outline" onClick={() => setIsConfirmingDelete(true)}>Удалить</button>
                )}
            </section>
        </div>
    );
}
