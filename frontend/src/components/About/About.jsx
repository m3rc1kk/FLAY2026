import ButtonLink from "../Button/Button.jsx";
import telegramIcon from "../../assets/images/About/telegram.svg";
import useInView from "../../hooks/useInView.js";


export default function About() {
    const [sectionRef, inView] = useInView();

    return (
        <>
            <section className={`section about__section container${inView ? ' is-inview' : ''}`} id="about" ref={sectionRef}>
                <header className="section__header">
                    <h3 className="section__header-title">О нас</h3>
                </header>

                <div className="about">
                    <div className="about__inner">
                        <h1 className="about__title">
                            FANCLUB LEGENDS AWARDS OF THE YEAR
                        </h1>

                        <div className="about__text">
                            <p>
                                Ежегодная премия, созданная для того, чтобы отметить людей, достижения и события,
                                которые сделали этот год особенным. В рамках премии участники соревнуются в самых значимых,
                                выдающихся и, порой, совершенно неожиданных номинациях - от академических успехов до личных
                                достижений и статуса главной легенды года. FLAY - это возможность подвести итоги, отметить тех,
                                кто действительно заслужил признание, и официально определить главных героев этого года.
                            </p>
                        </div>

                        <ButtonLink className="about__button" href="https://t.me/flayof">Телеграм <img src={telegramIcon} width={24} height={24} loading={'lazy'} alt="Telegram" className="about__button-icon"/></ButtonLink>

                    </div>
                </div>
            </section>
        </>
    );
}