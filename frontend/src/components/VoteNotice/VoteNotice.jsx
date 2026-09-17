import { Link } from 'react-router-dom';

const ICONS = {
    lock: (
        <>
            <rect x="5" y="10.5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </>
    ),
    ban: (
        <>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </>
    ),
    alert: (
        <>
            <path d="M12 4l9 16H3l9-16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 10v4M12 17v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </>
    ),
};

const NOTICES = {
    auth: {
        tone: 'accent',
        icon: 'user',
        title: 'НУЖЕН ВХОД',
        text: 'Голосовать можно после входа через Telegram. Это займёт пару секунд.',
        action: { to: '/auth', label: 'Войти' },
    },
    not_allowed: {
        tone: 'danger',
        icon: 'lock',
        title: 'ТЕБЯ НЕТ В СПИСКЕ',
        text: 'Голосовать могут только участники фанклуба FLAY. Если это ошибка, отправь организатору свой Telegram ID.',
    },
    banned: {
        tone: 'danger',
        icon: 'ban',
        title: 'ГОЛОСОВАНИЕ НЕДОСТУПНО',
        text: 'Организатор ограничил доступ к голосованию для этого аккаунта.',
    },
    upcoming: {
        tone: 'muted',
        icon: 'clock',
        title: 'ГОЛОСОВАНИЕ ЕЩЁ НЕ НАЧАЛОСЬ',
        text: 'Кандидатов уже можно посмотреть. Голоса начнут приниматься, когда стартует таймер.',
    },
    finished: {
        tone: 'muted',
        icon: 'clock',
        title: 'ГОЛОСОВАНИЕ ЗАВЕРШЕНО',
        text: 'Голоса больше не принимаются. Итоги объявят на церемонии FLAY 2026.',
    },
    error: {
        tone: 'danger',
        icon: 'alert',
        title: 'ГОЛОС НЕ ОТПРАВЛЕН',
        text: 'Что-то пошло не так. Попробуй ещё раз чуть позже.',
    },
};

export default function VoteNotice({ type, telegramId, onClose }) {
    const notice = NOTICES[type] ?? NOTICES.error;

    return (
        <div className={`vote-notice is-${notice.tone}`} role="alert">
            <span className="vote-notice__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">{ICONS[notice.icon]}</svg>
            </span>

            <span className="vote-notice__body">
                <span className="vote-notice__title">{notice.title}</span>
                <span className="vote-notice__text">{notice.text}</span>
                {type === 'not_allowed' && telegramId && (
                    <span className="vote-notice__id">
                        TELEGRAM ID <span className="vote-notice__id-value">{telegramId}</span>
                    </span>
                )}
            </span>

            {notice.action && (
                <Link to={notice.action.to} className="vote-notice__action">{notice.action.label}</Link>
            )}

            <button type="button" className="vote-notice__close" onClick={onClose} aria-label="Скрыть">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
}
