import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import NomineeCard from "../../components/NomineeCard/NomineeCard.jsx";
import LogoMark from "../../components/LogoMark/LogoMark.jsx";
import { findNomination, nominations } from "../../data/nominations.js";
import { removeVote, saveVote, useVotes } from "../../data/votes.js";
import closeIcon from '../../assets/images/Nominee/close.svg'
import nomineeExample from '../../assets/images/Nominee/nominee-example.png'

const pad = (value) => String(value).padStart(2, '0');

function ArrowIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function NomineesBody({ nomination, titleId, closeRef, isSwitch, direction, onClose, onGo }) {
    const votes = useVotes();
    const voteTimerRef = useRef(null);
    const savedNominee = nomination.nominees.find((nominee) => nominee.number === votes[nomination.number]) ?? null;

    const [selected, setSelected] = useState(savedNominee);
    const [barNominee, setBarNominee] = useState(savedNominee);
    const [status, setStatus] = useState(savedNominee ? 'voted' : 'idle');

    const index = nominations.findIndex((item) => item.number === nomination.number);
    const previous = nominations[(index - 1 + nominations.length) % nominations.length];
    const next = nominations[(index + 1) % nominations.length];
    const isLast = index === nominations.length - 1;

    const select = useCallback((nominee) => {
        if (status !== 'idle') return;
        setSelected((current) => (current?.number === nominee.number ? null : nominee));
        setBarNominee(nominee);
    }, [status]);

    const cancel = useCallback(() => setSelected(null), []);

    const vote = useCallback(() => {
        if (!selected) return;
        setStatus('sending');
        voteTimerRef.current = setTimeout(() => {
            saveVote(nomination.number, selected.number);
            setStatus('voted');
        }, 1100);
    }, [nomination, selected]);

    const unvote = useCallback(() => {
        removeVote(nomination.number);
        setStatus('idle');
    }, [nomination]);

    useEffect(() => () => clearTimeout(voteTimerRef.current), []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (selected && status === 'idle') {
                    cancel();
                } else {
                    onClose();
                }
                return;
            }

            if (status === 'sending' || event.target.closest?.('input, textarea')) return;
            if (event.key === 'ArrowRight') onGo(next.number, 1);
            if (event.key === 'ArrowLeft') onGo(previous.number, -1);
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selected, status, cancel, onClose, onGo, next, previous]);

    const isBarVisible = Boolean(selected);
    const hasNominees = nomination.nominees.length > 0;

    return (
        <div
            className={`nominees container${isSwitch ? ' is-switch' : ''}${isBarVisible ? ' has-vote' : ''}`}
            style={{ '--direction': direction }}
        >
            <div className="nominees__inner">
                <header className="nominees__header">
                    <div className="nominees__header-text">
                        <span className="nominees__label">
                            КАТЕГОРИЯ {pad(nomination.number)}
                            <span className="nominees__label-total"> / {pad(nominations.length)}</span>
                        </span>
                        <div className="nominees__title" id={titleId}>{nomination.title}</div>
                    </div>

                    <div className="nominees__header-controls">
                        <button type="button" className="nominees__arrow nominees__arrow--prev" onClick={() => onGo(previous.number, -1)} disabled={status === 'sending'} aria-label={`Предыдущая категория: ${previous.title}`}>
                            <ArrowIcon />
                        </button>
                        <button type="button" className="nominees__arrow" onClick={() => onGo(next.number, 1)} disabled={status === 'sending'} aria-label={`Следующая категория: ${next.title}`}>
                            <ArrowIcon />
                        </button>
                        <button type="button" className="nominees__header-close" onClick={onClose} ref={closeRef} aria-label="Закрыть">
                            <img src={closeIcon} width={24} height={24} loading='lazy' alt=""/>
                        </button>
                    </div>
                </header>

                <nav className="nominees__steps" aria-label="Категории">
                    {nominations.map((item) => (
                        <button
                            type="button"
                            key={item.number}
                            className={`nominees__step${item.number === nomination.number ? ' is-current' : ''}${votes[item.number] !== undefined ? ' is-done' : ''}`}
                            onClick={() => onGo(item.number, item.number > nomination.number ? 1 : -1)}
                            disabled={status === 'sending' || item.number === nomination.number}
                            aria-label={item.title}
                            aria-current={item.number === nomination.number ? 'step' : undefined}
                        >
                            <span className="nominees__step-bar" />
                        </button>
                    ))}
                </nav>

                {hasNominees ? (
                    <div className={`nominees__cards${selected ? ' has-selection' : ''}`}>
                        {nomination.nominees.map((nominee, cardIndex) => (
                            <NomineeCard
                                key={nominee.number}
                                index={cardIndex}
                                name={nominee.name}
                                number={nominee.number}
                                image={nominee.image}
                                isSelected={selected?.number === nominee.number}
                                isVoted={status === 'voted' && selected?.number === nominee.number}
                                isLocked={status !== 'idle'}
                                onSelect={() => select(nominee)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="nominees__empty">
                        <LogoMark className="nominees__empty-mark" />
                        <span className="nominees__empty-title">Кандидаты появятся позже</span>
                        <span className="nominees__empty-text">Список для этой категории ещё собирается. Загляни в следующую.</span>
                        <button type="button" className="nominees-vote__submit nominees__empty-button" onClick={() => onGo(next.number, 1)}>
                            <span className="nominees-vote__submit-text">{next.title}</span>
                            <ArrowIcon className="nominees-vote__submit-icon" />
                        </button>
                    </div>
                )}
            </div>

            <div className={`nominees-vote${isBarVisible ? ' is-visible' : ''} is-${status}`}>
                <div className="nominees-vote__backdrop" />

                <div className="nominees-vote__inner container">
                    <div className="nominees-vote__line">
                        <span className="nominees-vote__line-fill" />
                    </div>

                    <div className="nominees-vote__body">
                        <div className="nominees-vote__nominee" key={barNominee?.number}>
                            <span className="nominees-vote__thumb">
                                <img src={barNominee?.image ?? nomineeExample} width={72} height={88} alt="" className="nominees-vote__thumb-image"/>
                            </span>

                            <span className="nominees-vote__text">
                                <span className="nominees-vote__label" role="status">
                                    {status === 'voted' ? 'ГОЛОС ПРИНЯТ' : status === 'sending' ? 'ОТПРАВЛЯЕМ ГОЛОС' : 'ТВОЙ ВЫБОР'}
                                    <span className="nominees-vote__label-dot" />
                                    КАНДИДАТ {pad(barNominee?.number ?? 0)}
                                </span>
                                <span className="nominees-vote__name">{barNominee?.name}</span>
                            </span>
                        </div>

                        <div className="nominees-vote__actions">
                            {status === 'voted' ? (
                                <>
                                    <button type="button" className="nominees-vote__cancel" onClick={unvote}>Отменить голос</button>
                                    <button type="button" className="nominees-vote__submit" onClick={isLast ? onClose : () => onGo(next.number, 1)}>
                                        <span className="nominees-vote__submit-text">{isLast ? 'К номинациям' : <>Следующая<span className="hidden-mobile"> категория</span></>}</span>
                                        <ArrowIcon className="nominees-vote__submit-icon" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="nominees-vote__cancel" onClick={cancel} disabled={status !== 'idle'}>Отменить</button>
                                    <button type="button" className="nominees-vote__submit" onClick={vote} disabled={status !== 'idle'}>
                                        <span className="nominees-vote__submit-text">{status === 'sending' ? 'Отправляем' : 'Проголосовать'}</span>
                                        <ArrowIcon className="nominees-vote__submit-icon" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Nominees() {
    const { number } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const titleId = useId();
    const modalRef = useRef(null);
    const closeRef = useRef(null);
    const closeTimerRef = useRef(null);
    const hasLeftRef = useRef(false);
    const nomination = findNomination(number);

    const [isClosing, setIsClosing] = useState(false);
    const [direction, setDirection] = useState(1);
    const [hasSwitched, setHasSwitched] = useState(false);

    const leave = useCallback(() => {
        if (hasLeftRef.current) return;
        hasLeftRef.current = true;
        clearTimeout(closeTimerRef.current);

        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    }, [location.key, navigate]);

    const close = useCallback(() => {
        setIsClosing(true);
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(leave, 900);
    }, [leave]);

    const go = useCallback((target, nextDirection) => {
        if (isClosing) return;
        setDirection(nextDirection);
        setHasSwitched(true);
        navigate(`/nominations/${target}`, { replace: true, state: location.state });
        modalRef.current?.scrollTo({ top: 0 });
    }, [isClosing, navigate, location.state]);

    useLayoutEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        const card = document.querySelector(`.nomination-card[href$="/nominations/${number}"]`);
        const rect = card?.getBoundingClientRect();
        const isVisible = rect && rect.bottom > 0 && rect.top < window.innerHeight;

        const x = isVisible ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = isVisible ? rect.top + rect.height / 2 : window.innerHeight / 2;

        modal.style.setProperty('--origin-x', `${x}px`);
        modal.style.setProperty('--origin-y', `${y}px`);
        modal.previousElementSibling?.style.setProperty('--origin-x', `${x}px`);
        modal.previousElementSibling?.style.setProperty('--origin-y', `${y}px`);
    }, [number]);

    const hasNomination = Boolean(nomination);

    useEffect(() => {
        if (!hasNomination) return;

        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus({ preventScroll: true });

        return () => {
            document.body.style.overflow = previousOverflow;
            clearTimeout(closeTimerRef.current);
            previousFocus?.focus?.({ preventScroll: true });
        };
    }, [hasNomination]);

    const handleAnimationEnd = (event) => {
        if (event.animationName === 'nominees-modal-out') leave();
    };

    if (!nomination) return <Navigate to="/" replace />;

    return (
        <>
            <div className={`nominees-wipe${isClosing ? ' is-closing' : ''}`} aria-hidden="true" />

            <div
                className={`nominees-modal${isClosing ? ' is-closing' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                ref={modalRef}
                onAnimationEnd={handleAnimationEnd}
            >
                <NomineesBody
                    key={nomination.number}
                    nomination={nomination}
                    titleId={titleId}
                    closeRef={closeRef}
                    isSwitch={hasSwitched}
                    direction={direction}
                    onClose={close}
                    onGo={go}
                />
            </div>
        </>
    );
}
