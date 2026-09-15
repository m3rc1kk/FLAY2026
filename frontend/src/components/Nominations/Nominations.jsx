import NominationCard from "../NominationCard/NominationCard.jsx";

const nominations = [
    { number: 1, title: 'FLAY KING' },
    { number: 2, title: 'FLAY QUEEN' },
    { number: 3, title: 'ШУМ ГОДА' },
    { number: 4, title: 'ПАРА ГОДА' },
    { number: 5, title: 'МЕМ ГОДА' },
    { number: 6, title: 'СКВАД ГОДА' },
    { number: 7, title: 'ТГКАНАЛ ГОДА' },
    { number: 8, title: 'МОЗГ ГОДА' },
    { number: 9, title: 'ЧАТТЕР ГОДА' },
];

export default function Nominations() {
    return (
        <>
            <section className="section nominations__section container">
                <header className="section__header">
                    <h3 className="section__header-title">Голосование</h3>
                </header>

                <div className="nominations">
                    <div className="nominations__inner">
                        {nominations.map((nomination) => (
                            <NominationCard
                                key={nomination.number}
                                number={nomination.number}
                                title={nomination.title}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
