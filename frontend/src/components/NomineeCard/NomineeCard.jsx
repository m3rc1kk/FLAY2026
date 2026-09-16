import ButtonLink from "../Button/Button.jsx";
import nomineeExample from '../../assets/images/Nominee/nominee-example.png'

export default function NomineeCard({ name, number, image = nomineeExample, index = 0, isSelected = false, isVoted = false, isLocked = false, onSelect }) {
    const stateClass = `${isSelected ? ' is-selected' : ''}${isVoted ? ' is-voted' : ''}`;
    const action = isVoted ? 'ГОЛОС ОТДАН' : isSelected ? 'ТВОЙ ВЫБОР' : 'ВЫБРАТЬ';

    return (
        <>
            <ButtonLink
                type="button"
                className={`nominee-card${stateClass}`}
                onClick={onSelect}
                disabled={isLocked}
                aria-pressed={isSelected}
                style={{ '--i': index }}
            >
                <span className="nominee-card__inner">
                    <span className="nominee-card__media">
                        <span className="nominee-card__photo">
                            <img src={image} width={410} height={500} loading='lazy' alt={name} className="nominee-card__image"/>
                        </span>
                        <span className="nominee-card__check" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    </span>
                    <span className="nominee-card__name" title={name}>{name}</span>
                    <span className="nominee-card__meta">
                        <span className="nominee-card__number">КАНДИДАТ {String(number).padStart(2, '0')}</span>
                        <span className="nominee-card__action">{action}</span>
                    </span>
                </span>
            </ButtonLink>
        </>
    );
}
