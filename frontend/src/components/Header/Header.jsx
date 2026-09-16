import { useEffect, useState } from 'react';
import ButtonLink from '../Button/Button.jsx';
import Logo from '../Logo/Logo.jsx';
import telegramIcon from '../../assets/images/Header/telegram.svg'

const LINKS = [
    { href: '#hero', label: 'Главная' },
    { href: '#about', label: 'О нас' },
    { href: '#winners', label: 'Победители' },
    { href: '#nominations', label: 'Голосование' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!isMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };
        const handleResize = () => {
            if (window.innerWidth > 767) setIsMenuOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
        };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="header container">
            <div className="header__inner">

                <div className="header__logo">
                    <Logo className={'logo__image'} />
                </div>

                <nav className="header__nav">
                    <ul className="header__nav-list">
                        {LINKS.map((link) => (
                            <li className="header__nav-item" key={link.href}>
                                <ButtonLink href={link.href} className={'header__nav-link button-text'}>{link.label}</ButtonLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header__actions">
                    <ButtonLink className="header__login" to="/auth">Войти <img src={telegramIcon} width={16} height={16} loading={'lazy'} alt="Telegram" className="header__login-icon"/></ButtonLink>

                    <button
                        type="button"
                        className={`header__burger${isMenuOpen ? ' is-open' : ''}`}
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                    >
                        <span className="header__burger-line" />
                        <span className="header__burger-line" />
                    </button>
                </div>

            </div>

            <div className={`mobile-menu${isMenuOpen ? ' is-open' : ''}`} id="mobile-menu" aria-hidden={!isMenuOpen} inert={!isMenuOpen}>
                <nav className="mobile-menu__nav">
                    {LINKS.map((link, index) => (
                        <a href={link.href} className="mobile-menu__link" key={link.href} style={{ '--i': index }} onClick={closeMenu}>
                            <span className="mobile-menu__index">{String(index + 1).padStart(2, '0')}</span>
                            <span className="mobile-menu__label">{link.label}</span>
                            <svg className="mobile-menu__arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </a>
                    ))}
                </nav>

                <div className="mobile-menu__footer">
                    <ButtonLink className="mobile-menu__login" to="/auth">Войти через Telegram <img src={telegramIcon} width={20} height={20} loading={'lazy'} alt="" className="header__login-icon"/></ButtonLink>
                    <a href="https://t.me/flayof" target="_blank" rel="noopener noreferrer" className="mobile-menu__telegram">t.me/flayof</a>
                </div>
            </div>
        </header>
    );
}
