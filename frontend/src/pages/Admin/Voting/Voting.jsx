import { useEffect, useState } from 'react';
import { DAY, formatDuration, getVotingStatus, notify, updateVoting, useAdminStore } from '../store.js';

const HOUR = 60 * 60 * 1000;

const toInputValue = (timestamp) => {
    const date = new Date(timestamp);
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromInputValue = (value) => (value ? new Date(value).getTime() : NaN);

const formatDateTime = (timestamp) => new Date(timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

const STATUS_COPY = {
    upcoming: { label: 'Скоро начнётся', short: 'Не началось' },
    active: { label: 'Голосование идёт', short: 'Идёт' },
    finished: { label: 'Голосование завершено', short: 'Завершено' },
};

const PARTICIPANTS = {
    upcoming: [
        'Номинации и кандидаты видны на сайте',
        'Кнопка «Проголосовать» неактивна',
        'Таймер показывает, сколько осталось до старта',
    ],
    active: [
        'Можно выбирать кандидатов и голосовать',
        'Голос можно отменить и отдать заново',
        'Таймер показывает, сколько осталось до конца',
    ],
    finished: [
        'Голосовать и отменять голос больше нельзя',
        'Все голоса сохранены',
        'На сайте надпись «Голосование завершено»',
    ],
};

const DURATIONS = [3, 5, 7];

function Timeline({ startsAt, endsAt, now, status }) {
    const progress = Math.min(1, Math.max(0, (now - startsAt) / (endsAt - startsAt)));

    return (
        <div className={`admin-timeline is-${status}`}>
            <div className="admin-timeline__track">
                <span className="admin-timeline__fill" style={{ width: `${progress * 100}%` }} />
                {status === 'active' && (
                    <span className="admin-timeline__now" style={{ left: `${progress * 100}%` }}>
                        <span className="admin-timeline__now-label">сейчас</span>
                    </span>
                )}
            </div>
            <div className="admin-timeline__labels">
                <span className="admin-timeline__point">
                    <span className="admin-timeline__caption">Старт</span>
                    {formatDateTime(startsAt)}
                </span>
                <span className="admin-timeline__duration">{formatDuration(endsAt - startsAt)}</span>
                <span className="admin-timeline__point admin-timeline__point--end">
                    <span className="admin-timeline__caption">Финиш</span>
                    {formatDateTime(endsAt)}
                </span>
            </div>
        </div>
    );
}

function ScheduleForm({ voting }) {
    const [start, setStart] = useState(toInputValue(voting.startsAt));
    const [end, setEnd] = useState(toInputValue(voting.endsAt));

    const startsAt = fromInputValue(start);
    const endsAt = fromInputValue(end);
    const isDirty = start !== toInputValue(voting.startsAt) || end !== toInputValue(voting.endsAt);

    let error = '';
    if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) error = 'Укажи дату и время начала и конца';
    else if (endsAt <= startsAt) error = 'Конец должен быть позже начала';
    else if (endsAt - startsAt < HOUR) error = 'Голосование должно длиться хотя бы час';

    const applyDuration = (days) => {
        if (Number.isNaN(startsAt)) return;
        setEnd(toInputValue(startsAt + days * DAY));
    };

    const save = (event) => {
        event.preventDefault();
        if (error || !isDirty) return;
        updateVoting({ startsAt, endsAt });
        notify('Сроки голосования сохранены');
    };

    const reset = () => {
        setStart(toInputValue(voting.startsAt));
        setEnd(toInputValue(voting.endsAt));
    };

    return (
        <form className="admin-card admin-form admin-schedule" onSubmit={save}>
            <header className="admin-card__header">
                <h2 className="admin-card__title">Сроки</h2>
                {isDirty && <span className="admin-card__meta admin-form__dirty">Есть несохранённые изменения</span>}
            </header>

            <div className="admin-schedule__fields">
                <label className="admin-field">
                    <span className="admin-field__label">Начало</span>
                    <input type="datetime-local" className="admin-field__input admin-schedule__input" value={start} onChange={(event) => setStart(event.target.value)} />
                </label>

                <svg className="admin-schedule__arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <label className="admin-field">
                    <span className="admin-field__label">Конец</span>
                    <input type="datetime-local" className="admin-field__input admin-schedule__input" value={end} onChange={(event) => setEnd(event.target.value)} />
                </label>
            </div>

            <div className="admin-schedule__meta">
                {error ? (
                    <span className="admin-field__error">{error}</span>
                ) : (
                    <span className="admin-field__hint">Продолжительность: <b>{formatDuration(endsAt - startsAt)}</b></span>
                )}

                <span className="admin-schedule__presets">
                    <span className="admin-field__hint">Длится</span>
                    {DURATIONS.map((days) => (
                        <button type="button" key={days} className="admin-chips__chip" onClick={() => applyDuration(days)} disabled={Number.isNaN(startsAt)}>
                            {days} дн
                        </button>
                    ))}
                </span>
            </div>

            <div className="admin-form__actions">
                <button type="submit" className="admin-button" disabled={!isDirty || Boolean(error)}>Сохранить сроки</button>
                {isDirty && <button type="button" className="admin-button admin-button--ghost" onClick={reset}>Отменить</button>}
            </div>
        </form>
    );
}

export default function Voting() {
    const voting = useAdminStore((state) => state.voting);
    const [now, setNow] = useState(() => Date.now());
    const [confirm, setConfirm] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const status = getVotingStatus(voting, now);

    const run = (action) => {
        const current = Date.now();
        if (action === 'start') {
            updateVoting({ startsAt: current, endsAt: Math.max(voting.endsAt, current + DAY) });
            notify('Голосование началось');
        }
        if (action === 'finish') {
            updateVoting({ endsAt: current });
            notify('Голосование завершено');
        }
        if (action === 'resume') {
            updateVoting({ endsAt: current + DAY });
            notify('Голосование возобновлено на сутки');
        }
        if (action === 'hour') {
            updateVoting({ endsAt: voting.endsAt + HOUR });
            notify('Голосование продлено на час');
        }
        if (action === 'day') {
            updateVoting({ endsAt: voting.endsAt + DAY });
            notify('Голосование продлено на сутки');
        }
        setConfirm(null);
        setNow(Date.now());
    };

    const countdown = status === 'upcoming'
        ? `Старт через ${formatDuration(voting.startsAt - now)}`
        : status === 'active'
            ? `До конца ${formatDuration(voting.endsAt - now)}`
            : `Закончилось ${formatDateTime(voting.endsAt)}`;

    return (
        <div className="admin-voting">
            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">FLAY 2026</span>
                    <h1 className="admin-page__title">Голосование</h1>
                </div>
            </header>

            <section className={`admin-card admin-voting-status is-${status}`}>
                <div className="admin-voting-status__top">
                    <div className="admin-voting-status__state">
                        <span className="admin-voting-status__badge">
                            <span className="admin-voting-status__dot" />
                            {STATUS_COPY[status].short}
                        </span>
                        <h2 className="admin-voting-status__title">{STATUS_COPY[status].label}</h2>
                        <span className="admin-voting-status__countdown">{countdown}</span>
                    </div>

                    <div className="admin-voting-status__actions">
                        {confirm ? (
                            <div className="admin-voting-status__confirm">
                                <span className="admin-voting-status__confirm-text">
                                    {confirm === 'finish' && 'Завершить сейчас? Голосовать сразу станет нельзя.'}
                                    {confirm === 'start' && 'Начать сейчас? Участники смогут голосовать.'}
                                    {confirm === 'resume' && 'Открыть голосование ещё на сутки?'}
                                </span>
                                <span className="admin-danger__actions">
                                    <button type="button" className={`admin-button ${confirm === 'finish' ? 'admin-button--danger' : ''}`} onClick={() => run(confirm)}>
                                        {confirm === 'finish' ? 'Да, завершить' : confirm === 'start' ? 'Да, начать' : 'Да, открыть'}
                                    </button>
                                    <button type="button" className="admin-button admin-button--ghost" onClick={() => setConfirm(null)}>Отмена</button>
                                </span>
                            </div>
                        ) : (
                            <>
                                {status === 'upcoming' && (
                                    <button type="button" className="admin-button" onClick={() => setConfirm('start')}>Начать сейчас</button>
                                )}
                                {status === 'active' && (
                                    <>
                                        <button type="button" className="admin-button admin-button--ghost" onClick={() => run('hour')}>+1 час</button>
                                        <button type="button" className="admin-button admin-button--ghost" onClick={() => run('day')}>+1 день</button>
                                        <button type="button" className="admin-button admin-button--danger-outline" onClick={() => setConfirm('finish')}>Завершить сейчас</button>
                                    </>
                                )}
                                {status === 'finished' && (
                                    <button type="button" className="admin-button admin-button--outline" onClick={() => setConfirm('resume')}>Возобновить на сутки</button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Timeline startsAt={voting.startsAt} endsAt={voting.endsAt} now={now} status={status} />
            </section>

            <div className="admin-voting__grid">
                <ScheduleForm key={`${voting.startsAt}-${voting.endsAt}`} voting={voting} />

                <section className="admin-card admin-voting-rules">
                    <header className="admin-card__header">
                        <h2 className="admin-card__title">Что видят участники</h2>
                    </header>

                    <div className="admin-voting-rules__list">
                        {Object.keys(PARTICIPANTS).map((key) => (
                            <div className={`admin-voting-rules__stage${key === status ? ' is-current' : ''}`} key={key}>
                                <span className="admin-voting-rules__name">
                                    {STATUS_COPY[key].short}
                                    {key === status && <span className="admin-voting-rules__now">сейчас</span>}
                                </span>
                                <ul className="admin-voting-rules__items">
                                    {PARTICIPANTS[key].map((text) => <li key={text}>{text}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
