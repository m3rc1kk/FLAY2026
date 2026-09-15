import ButtonLink from "../Button/Button.jsx";
import plusIcon from "../../assets/images/Vote/plus.png";
import plusBlackIcon from "../../assets/images/Vote/plus-black.png";

export default function NominationCard({ number, title }) {
    return (
        <>
            <ButtonLink to={'/'} className='nomination-card'>
                <div className="nomination-card__inner">
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
