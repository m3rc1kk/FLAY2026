import NominationCard from "../NominationCard/NominationCard.jsx";
import { nominations } from "../../data/nominations.js";
import { useVotes } from "../../data/votes.js";
import useInView from "../../hooks/useInView.js";
import Countdown from "../Countdown/Countdown.jsx";
import { VOTING_ENDS_AT } from "../../config.js";

export default function Nominations() {
    const [sectionRef, inView] = useInView();
    const votes = useVotes();
    const total = nominations.length;
    const done = nominations.filter((nomination) => votes[nomination.number] !== undefined).length;

    return (
        <>
            <section className={`section nominations__section container${inView ? ' is-inview' : ''}`} id="nominations" ref={sectionRef}>
                <header className="nominations__header">
                    <div className={`nominations__progress${done === total ? ' is-complete' : ''}`}>
                        <ul
                            className="nominations__progress-track"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={total}
                            aria-valuenow={done}
                            aria-label="Пройденные номинации"
                        >
                            {nominations.map((nomination, index) => (
                                <li
                                    key={nomination.number}
                                    className={`nominations__progress-segment${votes[nomination.number] !== undefined ? ' is-done' : ''}`}
                                    style={{ '--i': index }}
                                />
                            ))}
                        </ul>
                        <span className="nominations__progress-label">
                            {done === total ? 'ВСЕ НОМИНАЦИИ ПРОЙДЕНЫ' : `${done} ИЗ ${total} НОМИНАЦИЙ ПРОЙДЕНО`}
                        </span>
                    </div>

                    <h2 className="nominations__title" aria-label="Голосование">
                        <span aria-hidden="true">ГОЛО</span>
                        <span className="nominations__title-outline" aria-hidden="true">СОВ</span>
                        <span aria-hidden="true">АНИЕ</span>
                    </h2>

                    <Countdown endsAt={VOTING_ENDS_AT} />
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
