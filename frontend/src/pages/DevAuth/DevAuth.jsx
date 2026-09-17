import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginDev, logout, useAuth } from "../../data/auth.js";

const RESTRICTIONS = {
    not_allowed: 'нет в списке, голосовать нельзя',
    banned: 'заблокирован',
};

export default function DevAuth() {
    const { user, status } = useAuth();
    const [form, setForm] = useState({ id: '', first_name: '', username: '' });
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);

    const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const submit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);
        try {
            await loginDev({ id: Number(form.id), first_name: form.first_name, username: form.username });
        } catch (loginError) {
            setError(loginError.status === 404 ? 'Тестовый вход выключен на бэке: нужен DEBUG=True и TELEGRAM_DEV_AUTH=True' : JSON.stringify(loginError.data ?? loginError.message));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <main className="dev-auth">
            <div className="dev-auth__card">
                <span className="dev-auth__badge">DEV</span>
                <h1 className="dev-auth__title">Тестовый вход</h1>
                <p className="dev-auth__text">Вход без Telegram, работает только локально. Бэк создаёт пользователя так же, как после входа через Telegram.</p>

                {status === 'authenticated' && user ? (
                    <div className="dev-auth__session">
                        <dl className="dev-auth__list">
                            <dt>Имя</dt>
                            <dd>{user.first_name} {user.last_name}</dd>
                            <dt>Telegram ID</dt>
                            <dd>{user.telegram_id ?? 'нет'}</dd>
                            <dt>Username</dt>
                            <dd>{user.telegram_username ? `@${user.telegram_username}` : 'нет'}</dd>
                            <dt>Голосование</dt>
                            <dd className={user.vote_restriction ? 'is-bad' : 'is-good'}>
                                {user.vote_restriction ? RESTRICTIONS[user.vote_restriction] : 'можно голосовать'}
                            </dd>
                            <dt>Суперюзер</dt>
                            <dd>{user.is_superuser ? 'да' : 'нет'}</dd>
                        </dl>

                        <div className="dev-auth__actions">
                            <Link to="/#nominations" className="dev-auth__button">К голосованию</Link>
                            <button type="button" className="dev-auth__button dev-auth__button--ghost" onClick={logout}>Выйти</button>
                        </div>
                    </div>
                ) : (
                    <form className="dev-auth__form" onSubmit={submit}>
                        <label className="dev-auth__field">
                            <span className="dev-auth__label">Telegram ID</span>
                            <input className="dev-auth__input" name="id" type="number" min="1" required value={form.id} onChange={change} placeholder="123456789" />
                        </label>
                        <label className="dev-auth__field">
                            <span className="dev-auth__label">Имя</span>
                            <input className="dev-auth__input" name="first_name" required value={form.first_name} onChange={change} placeholder="Максим" />
                        </label>
                        <label className="dev-auth__field">
                            <span className="dev-auth__label">Username</span>
                            <input className="dev-auth__input" name="username" value={form.username} onChange={change} placeholder="необязательно" />
                        </label>

                        {error && <span className="dev-auth__error" role="alert">{error}</span>}

                        <button type="submit" className="dev-auth__button" disabled={isPending || status === 'loading'}>
                            {isPending ? 'Входим' : 'Войти'}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
