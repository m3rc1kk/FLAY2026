import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import NomineeCard from "../../components/NomineeCard/NomineeCard.jsx";
import { findNomination } from "../../data/nominations.js";
import { saveVote, useVotes } from "../../data/votes.js";
import closeIcon from '../../assets/images/Nominee/close.svg'
import nomineeExample from '../../assets/images/Nominee/nominee-example.png'

export default function Nominees() {
    const { number } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const titleId = useId();
    const modalRef = useRef(null);
    const closeRef = useRef(null);
    const voteTimerRef = useRef(null);
    const closeTimerRef = useRef(null);
    const hasLeftRef = useRef(false);
    const nomination = findNomination(number);
    const votes = useVotes();
    const savedNominee = nomination?.nominees.find((nominee) => nominee.number === votes[nomination.number]) ?? null;

    const [isClosing, setIsClosing] = useState(false);
    const [selected, setSelected] = useState(savedNominee);
    const [barNominee, setBarNominee] = useState(savedNominee);
    const [status, setStatus] = useState(savedNominee ? 'voted' : 'idle');

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

    const select = useCallback((nominee) => {
        if (status !== 'idle') return;
        setSelected((current) => (current?.number === nominee.number ? null : nominee));
        setBarNominee(nominee);
    }, [status]);

    const cancel = useCallback(() => {
        setSelected(null);
    }, []);

    const vote = useCallback(() => {
        if (!selected) return;
        setStatus('sending');
        voteTimerRef.current = setTimeout(() => {
            saveVote(nomination.number, selected.number);
            setStatus('voted');
        }, 1100);
    }, [nomination, selected]);

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

    useEffect(() => {
        if (!nomination) return;

        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus({ preventScroll: true });

        return () => {
            document.body.style.overflow = previousOverflow;
            clearTimeout(voteTimerRef.current);
            clearTimeout(closeTimerRef.current);
            previousFocus?.focus?.({ preventScroll: true });
        };
    }, [nomination]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            if (selected && status === 'idle') {
                cancel();
            } else {
                close();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selected, status, cancel, close]);

    const handleAnimationEnd = (event) => {
        if (event.animationName === 'nominees-modal-out') leave();
    };

    if (!nomination) return <Navigate to="/" replace />;

    const isBarVisible = Boolean(selected);
    const categoryNumber = String(nomination.number).padStart(2, '0');

    return (
        <>
            <div className={`nominees-wipe${isClosing ? ' is-closing' : ''}`} aria-hidden="true" />

            <div
                className={`nominees-modal${isClosing ? ' is-closing' : ''}${isBarVisible ? ' has-vote' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                ref={modalRef}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className="nominees container">
                    <div className="nominees__inner">
                        <header className="nominees__header">
                            <div className="nominees__header-text">
                                <span className="nominees__label">КАТЕГОРИЯ {categoryNumber}</span>
                                <div className="nominees__title" id={titleId}>{nomination.title}</div>
                            </div>

                            <button type="button" className="nominees__header-close" onClick={close} ref={closeRef} aria-label="Закрыть">
                                <img src={closeIcon} width={24} height={24} loading='lazy' alt=""/>
                            </button>
                        </header>

                        <div className={`nominees__cards${selected ? ' has-selection' : ''}`}>
                            {nomination.nominees.map((nominee, index) => (
                                <NomineeCard
                                    key={nominee.number}
                                    index={index}
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
                    </div>
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
                                        КАНДИДАТ {String(barNominee?.number ?? 0).padStart(2, '0')}
                                    </span>
                                    <span className="nominees-vote__name">{barNominee?.name}</span>
                                </span>
                            </div>

                            <div className="nominees-vote__actions">
                                {status === 'voted' ? (
                                    <button type="button" className="nominees-vote__submit" onClick={close}>
                                        <span className="nominees-vote__submit-text">К номинациям</span>
                                        <svg className="nominees-vote__submit-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                ) : (
                                    <>
                                        <button type="button" className="nominees-vote__cancel" onClick={cancel} disabled={status !== 'idle'}>Отменить</button>
                                        <button type="button" className="nominees-vote__submit" onClick={vote} disabled={status !== 'idle'}>
                                            <span className="nominees-vote__submit-text">{status === 'sending' ? 'Отправляем' : 'Проголосовать'}</span>
                                            <svg className="nominees-vote__submit-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
