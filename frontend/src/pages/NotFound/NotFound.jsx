import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ButtonLink from "../../components/Button/Button.jsx";
import LogoMark from "../../components/LogoMark/LogoMark.jsx";

export default function NotFound() {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Страница не найдена | FLAY 2026';
        return () => {
            document.title = previousTitle;
        };
    }, []);

    return (
        <main className="not-found">
            <div className="not-found__inner container">
                <Link to="/" className="not-found__logo" aria-label="На главную">
                    <LogoMark className="not-found__logo-mark" assemble />
                </Link>

                <h1 className="not-found__code" aria-label="404">
                    <span className="not-found__digit" aria-hidden="true">4</span>
                    <span className="not-found__digit not-found__digit--fill" aria-hidden="true">0</span>
                    <span className="not-found__digit" aria-hidden="true">4</span>
                </h1>

                <div className="not-found__text">
                    <span className="not-found__title">Такой страницы нет</span>
                    <span className="not-found__description">Ссылка устарела или в адресе опечатка. Все номинации и победители на главной.</span>
                </div>

                <ButtonLink to="/" className="not-found__button">На главную</ButtonLink>
            </div>
        </main>
    );
}
