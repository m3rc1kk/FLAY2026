import ButtonLink from "../Button/Button.jsx";
import plusIcon from "../../assets/images/Vote/plus.png";
import plusBlackIcon from "../../assets/images/Vote/plus-black.png";
import { useVotes } from "../../data/votes.js";

export default function NominationCard({ id, number, title }) {
    const isVoted = useVotes()[id] !== undefined;

    return (
        <>
            <ButtonLink to={`/nominations/${id}`} className={`nomination-card${isVoted ? ' is-voted' : ''}`}>
                <div className="nomination-card__inner">
                    {isVoted && (
                        <span className="nomination-card__badge">
                            <svg className="nomination-card__badge-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="nomination-card__badge-text">Голос отдан</span>
                        </span>
                    )}
                    <header className="nomination-card__header">
                        <span className="nomination-card__number">{String(number).padStart(2, '0')}</span>
                    </header>

                    <h1 className="nomination-card__title">
                        {title.split(' ').map((word, index) => (
                            <span key={index} className="nomination-card__title-word">{index > 0 ? ' ' : ''}{word}</span>
                        ))}
                    </h1>

                    <div className="nomination-card__decoration">
                        <img src={plusBlackIcon} width={100} height={100} loading={'lazy'} alt="Plus" className="nomination-card__decoration-image nomination-card__decoration-image--on-light"/>
                        <img src={plusIcon} width={100} height={100} loading={'lazy'} alt="Plus" className="nomination-card__decoration-image nomination-card__decoration-image--on-dark"/>
                    </div>
                </div>
            </ButtonLink>
        </>
    );
}
