import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import LogoMark from "../../components/LogoMark/LogoMark.jsx";
import ButtonLink from "../../components/Button/Button.jsx";
import { loginWithTelegram, useAuth } from "../../data/auth.js";
import telegramIcon from '../../assets/images/Auth/telegram.svg'
import backgroundImage from '../../assets/images/Auth/back.png'

const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID;
const TELEGRAM_OAUTH_URL = 'https://oauth.telegram.org/auth';
const AUTH_RESULT = /[#?&]tgAuthResult=([A-Za-z0-9\-_=]+)/;

const readAuthResult = () => {
    const match = window.location.hash.match(AUTH_RESULT);
    if (!match) return null;

    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    try {
        const base64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')));
    } catch {
        return null;
    }
};

let pendingAuthData = readAuthResult();

export default function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from ?? new URLSearchParams(location.search).get('next') ?? '/';
    const { status } = useAuth();
    const [isPending, setIsPending] = useState(Boolean(pendingAuthData));
    const [error, setError] = useState(null);

    useEffect(() => {
        const data = pendingAuthData;
        if (!data) return;
        pendingAuthData = null;

        loginWithTelegram(data)
            .then(() => navigate(redirectTo, { replace: true }))
            .catch(() => {
                setError('Не получилось войти. Попробуй ещё раз');
                setIsPending(false);
            });
    }, [navigate, redirectTo]);

    const login = () => {
        if (!TELEGRAM_BOT_ID) {
            setError('Вход через Telegram не настроен');
            return;
        }

        const next = location.state?.from;
        const params = new URLSearchParams({
            bot_id: TELEGRAM_BOT_ID,
            origin: window.location.origin,
            return_to: window.location.origin + location.pathname + (next ? `?next=${encodeURIComponent(next)}` : ''),
        });
        window.location.href = `${TELEGRAM_OAUTH_URL}?${params}`;
    };

    if (status === 'authenticated' && !isPending) return <Navigate to={redirectTo} replace />;

    return (
        <>
            <div className="auth">
                <div className="auth__inner">
                    <div className="logo auth__logo">
                        <LogoMark className="logo__image" assemble />
                    </div>
                    <h1 className="auth__title" aria-label="FLAY">
                        <span className="auth__title-letter" style={{ '--i': 0 }} aria-hidden="true">F</span>
                        <span className="auth__title-light" aria-hidden="true">
                            {'LAY'.split('').map((letter, index) => (
                                <span key={letter} className="auth__title-letter" style={{ '--i': index + 1 }}>{letter}</span>
                            ))}
                        </span>
                    </h1>
                    <span className="auth__description">Закрытое голосование • FLAY 2026 </span>
                    <ButtonLink type="button" onClick={login} disabled={isPending} className={'button__link auth__button'}>
                        {isPending ? 'Входим' : 'Войти через Telegram'}
                        <img src={telegramIcon} width={24} height={24} loading='lazy' alt="Telegram" className="auth__button-icon"/>
                    </ButtonLink>
                    {error && <span className="auth__error" role="alert">{error}</span>}
                </div>

                <div className="auth__background">
                    <img src={backgroundImage} width={1920} height={1080} loading='lazy' alt="Background" className="auth__background-image"/>
                </div>
            </div>
        </>
    );
}
