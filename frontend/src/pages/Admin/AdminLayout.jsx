import { useEffect } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import LogoMark from '../../components/LogoMark/LogoMark.jsx';
import NotFound from '../NotFound/NotFound.jsx';
import { logout, useAuth } from '../../data/auth.js';
import { loadAdmin, refreshAdmin, useAdminStore } from './store.js';
import { initials } from './ui.jsx';

const REFRESH_INTERVAL = 20000;

function Icon({ name }) {
    const paths = {
        dashboard: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z',
        nominations: 'M6 3h12v4a6 6 0 0 1-12 0V3zm6 10v4m-4 4h8M6 5H3v1a3 3 0 0 0 3 3m12-4h3v1a3 3 0 0 1-3 3',
        voting: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
        users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m6.5-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.85M15.5 3.15a3.5 3.5 0 0 1 0 6.7',
        access: 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3zm-3 9l2 2 4-4',
        logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
        django: 'M4 7h16M4 12h16M4 17h10m4 0h2',
        external: 'M14 4h6v6m0-6L10 14M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5',
    };

    return (
        <svg className="admin-nav__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d={paths[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={name === 'dashboard' ? 'currentColor' : 'none'} />
        </svg>
    );
}

const NAV = [
    { to: '/admin', label: 'Дашборд', icon: 'dashboard', end: true },
    { to: '/admin/voting', label: 'Голосование', icon: 'voting' },
    { to: '/admin/nominations', label: 'Номинации', icon: 'nominations' },
    { to: '/admin/users', label: 'Пользователи', icon: 'users' },
    { to: '/admin/access', label: 'Список доступа', icon: 'access' },
];

function AdminPanel({ user }) {
    const toast = useAdminStore((state) => state.toast);
    const status = useAdminStore((state) => state.status);
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Админ';

    useEffect(() => {
        loadAdmin();
        const timer = setInterval(refreshAdmin, REFRESH_INTERVAL);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="admin">
            <aside className="admin__sidebar">
                <Link to="/admin" className="admin__brand">
                    <LogoMark className="admin__brand-mark" />
                    <span className="admin__brand-text">Admin</span>
                </Link>

                <nav className="admin-nav" aria-label="Разделы админки">
                    {NAV.map((item) => (
                        item.to ? (
                            <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}>
                                <Icon name={item.icon} />
                                <span className="admin-nav__label">{item.label}</span>
                            </NavLink>
                        ) : (
                            <span key={item.label} className="admin-nav__link is-disabled" aria-disabled="true">
                                <Icon name={item.icon} />
                                <span className="admin-nav__label">{item.label}</span>
                                <span className="admin-nav__soon">скоро</span>
                            </span>
                        )
                    ))}
                </nav>

                <div className="admin__sidebar-footer">
                    <Link to="/" className="admin-nav__link admin-nav__link--muted">
                        <Icon name="external" />
                        <span className="admin-nav__label">На сайт</span>
                    </Link>

                    <a href="/django-admin/" target="_blank" rel="noopener noreferrer" className="admin-nav__link admin-nav__link--muted">
                        <Icon name="django" />
                        <span className="admin-nav__label">Django admin</span>
                    </a>

                    <div className="admin__profile">
                        <span className="admin__avatar">{initials(name)}</span>
                        <span className="admin__profile-text">
                            <span className="admin__profile-name">{name}</span>
                            <span className="admin__profile-role">Организатор</span>
                        </span>
                    </div>

                    <button type="button" className="admin-nav__link admin-nav__link--muted admin-nav__button" onClick={logout}>
                        <Icon name="logout" />
                        <span className="admin-nav__label">Выйти</span>
                    </button>
                </div>
            </aside>

            <main className="admin__main">
                {status === 'ready' && <Outlet />}
                {status === 'loading' && <div className="admin-empty"><span className="admin-empty__text">Загружаем данные</span></div>}
                {status === 'error' && (
                    <div className="admin-empty">
                        <span className="admin-empty__title">Не получилось загрузить данные</span>
                        <button type="button" className="admin-button admin-button--ghost" onClick={loadAdmin}>Попробовать ещё раз</button>
                    </div>
                )}
            </main>

            <div className="admin-toast-region" role="status" aria-live="polite">
                {toast && (
                    <div className={`admin-toast admin-toast--${toast.type}`} key={toast.id}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <path d={toast.type === 'error' ? 'M12 7v6m0 4h.01' : 'M5 12.5l4.5 4.5L19 7.5'} stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {toast.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return null;
    if (status !== 'authenticated') return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    if (!user.is_superuser) return <NotFound />;

    return <AdminPanel user={user} />;
}
