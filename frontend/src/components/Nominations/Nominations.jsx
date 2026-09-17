import NominationCard from "../NominationCard/NominationCard.jsx";
import { useNominations } from "../../data/nominations.js";
import { useVotes } from "../../data/votes.js";
import useInView from "../../hooks/useInView.js";
import Countdown from "../Countdown/Countdown.jsx";
import { useVoting } from "../../data/voting.js";

export default function Nominations() {
    const [sectionRef, inView] = useInView();
    const { items: nominations } = useNominations();
    const voting = useVoting();
    const votes = useVotes();
    const total = nominations.length;
    const done = nominations.filter((nomination) => votes[nomination.id] !== undefined).length;
    const isComplete = total > 0 && done === total;

    return (
        <>
            <section className={`section nominations__section container${inView ? ' is-inview' : ''}`} id="nominations" ref={sectionRef}>
                <header className="nominations__header">
                    <div className={`nominations__progress${isComplete ? ' is-complete' : ''}`}>
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
                                    key={nomination.id}
                                    className={`nominations__progress-segment${votes[nomination.id] !== undefined ? ' is-done' : ''}`}
                                    style={{ '--i': index }}
                                />
                            ))}
                        </ul>
                        <span className="nominations__progress-label">
                            {isComplete ? 'ВСЕ НОМИНАЦИИ ПРОЙДЕНЫ' : `${done} ИЗ ${total} НОМИНАЦИЙ ПРОЙДЕНО`}
                        </span>
                    </div>

                    <h2 className="nominations__title" aria-label="Голосование">
                        <span aria-hidden="true">ГОЛО</span>
                        <span className="nominations__title-outline" aria-hidden="true">СОВ</span>
                        <span aria-hidden="true">АНИЕ</span>
                    </h2>

                    {voting?.ends_at && <Countdown startsAt={voting.starts_at} endsAt={voting.ends_at} />}
                </header>

                <div className="nominations">
                    <div className="nominations__inner">
                        {nominations.map((nomination) => (
                            <NominationCard
                                key={nomination.id}
                                id={nomination.id}
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
