import ButtonLink from "../Button/Button.jsx";
import heroStat from "../../assets/images/Hero/stat.png";
import voteIcon from "../../assets/images/Hero/vote.svg";
import aboutIcon from "../../assets/images/Hero/about.svg";
import starDecor from '../../assets/images/Hero/star.png'
import backgroundImage from '../../assets/images/Hero/back.png';

export default function Hero() {
    return (
        <>
            <div className="hero container">
                <div className="hero__inner">

                    <div className="hero__body">
                        <div className="hero__text">
                            <h1 className="hero__title">FLAY</h1>
                            <h2 className="hero__year">20<span className="hero__year--green">26</span></h2>
                        </div>

                        <div className="hero__buttons">
                            <ButtonLink to={'/'} className={'hero__button'}>Голосовать <img src={voteIcon} width={24} height={24} loading={'lazy'} alt="Vote" className="hero__button-icon"/></ButtonLink>
                            <ButtonLink to={'/'} className={'hero__button button-light'}>О премии <img src={aboutIcon} width={24} height={24} loading={'lazy'} alt="About" className="hero__button-icon"/></ButtonLink>
                        </div>
                    </div>

                    <div className="hero__image">
                        <img src={heroStat} width={721} height={1121} loading={'lazy'} alt="Decoration" className="hero__text-decoration"/>
                    </div>
                </div>

                <div className="hero__decoration">
                    <img src={starDecor} width={420} height={683} loading='lazy' alt="Star" className="hero__decoration-image"/>
                </div>

                <div className="hero__background">
                    <img src={backgroundImage} width={1920} height={1498} loading={'lazy'} alt="Background" className="hero__background-image"/>
                </div>
            </div>

        </>
    );
}