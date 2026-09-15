import Logo from "../Logo/Logo.jsx";
import ButtonLink from "../Button/Button.jsx";
import telegramIcon from '../../assets/images/Footer/telegram.svg'

export default function Footer() {
    return (
        <>
            <footer className="footer container">
                <div className="footer__inner">
                    <Logo className={'footer__logo'} />

                    <span className="footer__text">FLAY 2026 • Eternity</span>
                    
                    <ButtonLink to={'/'} className="footer__link button-text">
                        <img src={telegramIcon} width={32} height={32} loading='lazy' alt="Telegram" className="footer__link-icon"/>
                    </ButtonLink>
                </div>
            </footer>
        </>
    );
}