import Logo from "../../components/Logo/Logo.jsx";
import ButtonLink from "../../components/Button/Button.jsx";
import telegramIcon from '../../assets/images/Auth/telegram.svg'
import backgroundImage from '../../assets/images/Auth/back.png'

export default function Auth() {
    return (
        <>
            <div className="auth">
                <div className="auth__inner">
                    <Logo className={'auth__logo'} />
                    <h1 className="auth__title">
                        F<span className="auth__title-light">LAY</span>
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