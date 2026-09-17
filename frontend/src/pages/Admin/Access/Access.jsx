import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addAllowed, notify, removeAllowed, useAdminStore } from '../store.js';
import { formatAgo, UserAvatar } from '../Users/UsersList.jsx';

const parseLines = (text) => text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
        const match = line.match(/^(\d{3,20})[\s,;:-]*(.*)$/);
        return match ? { telegramId: Number(match[1]), name: match[2].trim() } : { invalid: line };
    });

function AddForm({ allowedIds }) {
    const [mode, setMode] = useState('single');
    const [telegramId, setTelegramId] = useState('');
    const [name, setName] = useState('');
    const [bulk, setBulk] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const lines = parseLines(bulk);
    const valid = lines.filter((line) => !line.invalid && !allowedIds.has(line.telegramId));
    const invalid = lines.filter((line) => line.invalid);
    const duplicates = lines.filter((line) => !line.invalid && allowedIds.has(line.telegramId));

    const addSingle = async (event) => {
        event.preventDefault();
        const id = Number(telegramId);
        if (!id || isSaving) return;
        if (allowedIds.has(id)) {
            notify('Этот Telegram ID уже в списке', 'error');
            return;
        }
        setIsSaving(true);
        const result = await addAllowed(id, name.trim());
        setIsSaving(false);
        if (!result) return;
        setTelegramId('');
        setName('');
        notify(`В списке: ${name.trim() || id}`);
    };

    const addBulk = async (event) => {
        event.preventDefault();
        if (!valid.length || isSaving) return;
        setIsSaving(true);
        let added = 0;
        for (const line of valid) {
            if (await addAllowed(line.telegramId, line.name)) added += 1;
        }
        setIsSaving(false);
        setBulk('');
        notify(`Добавлено в список: ${added}`);
    };

    return (
        <section className="admin-card admin-form admin-access-add">
            <header className="admin-card__header">
                <h2 className="admin-card__title">Добавить</h2>
                <div className="admin-chips">
                    <button type="button" className={`admin-chips__chip${mode === 'single' ? ' is-active' : ''}`} onClick={() => setMode('single')}>По одному</button>
                    <button type="button" className={`admin-chips__chip${mode === 'bulk' ? ' is-active' : ''}`} onClick={() => setMode('bulk')}>Списком</button>
                </div>
            </header>

            {mode === 'single' ? (
                <form className="admin-access-add__form" onSubmit={addSingle}>
                    <label className="admin-field">
                        <span className="admin-field__label">Telegram ID</span>
                        <input className="admin-field__input admin-access__mono" inputMode="numeric" value={telegramId} onChange={(event) => setTelegramId(event.target.value.replace(/\D/g, ''))} placeholder="123456789" />
                    </label>
                    <label className="admin-field">
                        <span className="admin-field__label">
                            Имя
                            <span className="admin-field__optional">для себя, необязательно</span>
                        </span>
                        <input className="admin-field__input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя Фамилия" maxLength={150} />
                    </label>
                    <div className="admin-form__actions">
                        <button type="submit" className="admin-button" disabled={!telegramId || isSaving}>{isSaving ? 'Добавляем' : 'Добавить'}</button>
                    </div>
                </form>
            ) : (
                <form className="admin-access-add__form" onSubmit={addBulk}>
                    <label className="admin-field">
                        <span className="admin-field__label">Каждый участник с новой строки</span>
                        <textarea className="admin-field__input admin-field__textarea admin-access__mono" rows={7} value={bulk} onChange={(event) => setBulk(event.target.value)} placeholder={'123456789 Максим Мерцалов\n987654321 Дарья Васильева'} />
                    </label>
                    {lines.length > 0 && (
                        <span className="admin-field__hint">
                            Добавится <b>{valid.length}</b>
                            {duplicates.length > 0 && <>, уже в списке {duplicates.length}</>}
                            {invalid.length > 0 && <>, <span className="admin-access__warning">без ID {invalid.length}</span></>}
                        </span>
                    )}
                    <div className="admin-form__actions">
                        <button type="submit" className="admin-button" disabled={!valid.length || isSaving}>{isSaving ? 'Добавляем' : 'Добавить всех'}</button>
                    </div>
                </form>
            )}

            <p className="admin-field__hint admin-access-add__note">
                Свой ID человек видит на сайте, если нажмёт «Проголосовать» без доступа. Ещё его показывает бот @userinfobot.
            </p>
        </section>
    );
}

function Pending({ users }) {
    const [pendingId, setPendingId] = useState(null);

    const allow = async (user) => {
        setPendingId(user.id);
        const result = await addAllowed(user.telegramId, user.name);
        setPendingId(null);
        if (result) notify(`Доступ открыт: ${user.name}`);
    };

    return (
        <section className="admin-card admin-access-pending">
            <header className="admin-card__header">
                <h2 className="admin-card__title">
                    Заходили без доступа
                    <span className="admin-card__count">{users.length}</span>
                </h2>
            </header>

            {users.length === 0 ? (
                <div className="admin-empty admin-empty--compact">
                    <span className="admin-empty__title">Таких нет</span>
                    <span className="admin-empty__text">Здесь появятся люди, которые вошли через Telegram, но не попали в список.</span>
                </div>
            ) : (
                <ul className="admin-access-pending__list">
                    {users.map((user) => (
                        <li className="admin-access-pending__item" key={user.id}>
                            <Link to={`/admin/users/${user.id}`} className="admin-access-pending__user">
                                <UserAvatar user={user} />
                                <span className="admin-access__identity">
                                    <span className="admin-access__name">{user.name}</span>
                                    <span className="admin-access__meta">{user.handle} · {formatAgo(user.joinedAt)}</span>
                                </span>
                            </Link>
                            <button type="button" className="admin-button admin-button--outline admin-button--small" onClick={() => allow(user)} disabled={pendingId === user.id}>Пустить</button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function Access() {
    const allowed = useAdminStore((state) => state.allowed);
    const users = useAdminStore((state) => state.users);
    const [query, setQuery] = useState('');
    const [confirmId, setConfirmId] = useState(null);

    const allowedIds = new Set(allowed.map((item) => item.telegramId));
    const pending = users.filter((user) => !user.isAllowed && user.status !== 'banned');
    const joined = allowed.filter((item) => item.user).length;

    const needle = query.trim().toLowerCase();
    const visible = allowed.filter((item) => !needle
        || String(item.telegramId).includes(needle)
        || item.name.toLowerCase().includes(needle)
        || item.user?.name.toLowerCase().includes(needle));

    const remove = async (item) => {
        setConfirmId(null);
        if (await removeAllowed(item.id)) notify(`Удалено из списка: ${item.name || item.telegramId}`);
    };

    return (
        <div className="admin-access">
            <header className="admin-page__header">
                <div className="admin-page__heading">
                    <span className="admin-page__eyebrow">FLAY 2026</span>
                    <h1 className="admin-page__title">
                        Список доступа
                        <sup className="admin-page__count">{allowed.length}</sup>
                    </h1>
                </div>
            </header>

            <div className="admin-toolbar">
                <span className="admin-toolbar__hint">Голосовать могут только эти Telegram ID. Заходили на сайт: {joined} из {allowed.length}.</span>

                <label className="admin-search">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                        <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm5-2 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID или имя" className="admin-search__input" />
                </label>
            </div>

            <div className="admin-access__grid">
                <section className="admin-card admin-access-list">
                    {visible.length === 0 ? (
                        <div className="admin-empty">
                            <span className="admin-empty__title">{allowed.length ? 'Ничего не нашлось' : 'Список пуст'}</span>
                            <span className="admin-empty__text">{allowed.length ? 'Проверь ID или имя.' : 'Пока никто не может голосовать. Добавь участников справа.'}</span>
                        </div>
                    ) : (
                        <ul className="admin-access-list__list">
                            {visible.map((item) => (
                                <li className={`admin-access-list__row${confirmId === item.id ? ' is-confirming' : ''}`} key={item.id}>
                                    <span className="admin-access__mono admin-access-list__id">{item.telegramId}</span>

                                    <span className="admin-access__identity">
                                        <span className="admin-access__name">{item.name || item.user?.name || 'Без имени'}</span>
                                        {item.user ? (
                                            <Link to={`/admin/users/${item.user.id}`} className="admin-access__meta admin-access__meta--joined">
                                                профиль на сайте: {item.user.name}
                                            </Link>
                                        ) : (
                                            <span className="admin-access__meta">входа ещё не было</span>
                                        )}
                                    </span>

                                    {confirmId === item.id ? (
                                        <span className="admin-danger__actions">
                                            <button type="button" className="admin-button admin-button--danger admin-button--small" onClick={() => remove(item)}>Убрать</button>
                                            <button type="button" className="admin-button admin-button--ghost admin-button--small" onClick={() => setConfirmId(null)}>Отмена</button>
                                        </span>
                                    ) : (
                                        <button type="button" className="admin-icon-button" onClick={() => setConfirmId(item.id)} aria-label={`Убрать ${item.telegramId} из списка`} title="Убрать из списка">
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <div className="admin-access__side">
                    <AddForm allowedIds={allowedIds} />
                    <Pending users={pending} />
                </div>
            </div>
        </div>
    );
}
