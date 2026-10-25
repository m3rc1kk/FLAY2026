import { useEffect } from 'react';
import LogoMark from "../../components/LogoMark/LogoMark.jsx";

export default function Preview() {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'FLAY 2026';
        return () => {
            document.title = previousTitle;
        };
    }, []);

    return (
        <main className="not-found">
            <div className="not-found__inner container">
                <LogoMark className="not-found__logo-mark" assemble />

                <div className="not-found__text">
                    <span className="not-found__title">Красава, нашёл домен</span>
                    <span className="not-found__description">Сайт пока закрыт. Скоро всё откроется.</span>
                </div>
            </div>
        </main>
    );
}
