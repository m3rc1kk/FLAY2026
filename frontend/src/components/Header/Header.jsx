import ButtonLink from '../Button/Button.jsx';
import Logo from '../Logo/Logo.jsx';
import telegramIcon from '../../assets/images/Header/telegram.svg'

export default function Header() {
    return (
        <header className="header container">
            <div className="header__inner">

                <div className="header__logo">
                    <Logo className={'logo__image'} />
                </div>

                <nav className="header__nav">
                    <ul className="header__nav-list">
                        <li className="header__nav-item">
                            <ButtonLink to={'/'} className={'header__nav-link button-text'}>Главная</ButtonLink>
                        </li>
                        <li className="header__nav-item">
                            <ButtonLink to={'/'} className={'header__nav-link button-text'}>О нас</ButtonLink>
                        </li>
                        <li className="header__nav-item">
                            <ButtonLink to={'/'} className={'header__nav-link button-text'}>Победители</ButtonLink>
                        </li>
                        <li className="header__nav-item">
                            <ButtonLink to={'/'} className={'header__nav-link button-text'}>Голосование</ButtonLink>
                        </li>
                    </ul>
                </nav>

                <ButtonLink className="header__login" to="/">Войти <img src={telegramIcon} width={16} height={16} loading={'lazy'} alt="Telegram" className="header__login-icon"/></ButtonLink>

            </div>
        </header>
    );
}