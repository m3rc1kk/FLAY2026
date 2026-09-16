import LogoMark from "../../components/LogoMark/LogoMark.jsx";
import ButtonLink from "../../components/Button/Button.jsx";
import telegramIcon from '../../assets/images/Auth/telegram.svg'
import backgroundImage from '../../assets/images/Auth/back.png'

export default function Auth() {
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
                    <ButtonLink to={'/'} className={'auth__button'}>Войти через Telegram
                        <img src={telegramIcon} width={24} height={24} loading='lazy' alt="Telegram" className="auth__button-icon"/>
                    </ButtonLink>

                </div>

                <div className="auth__background">
                    <img src={backgroundImage} width={1920} height={1080} loading='lazy' alt="Background" className="auth__background-image"/>
                </div>
            </div>
        </>
    );
}