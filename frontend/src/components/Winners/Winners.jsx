import { useEffect, useRef, useState } from 'react';
import { winners } from '../../data/winners.js';
import useInView from '../../hooks/useInView.js';

const pad = (value) => String(value).padStart(2, '0');

export default function Winners() {
    const [sectionRef, inView] = useInView();
    const boardRef = useRef(null);
    const previewRef = useRef(null);
    const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, frame: 0, started: false });
    const [active, setActive] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const pointer = pointerRef.current;
        return () => cancelAnimationFrame(pointer.frame);
    }, []);

    const render = () => {
        const pointer = pointerRef.current;
        const preview = previewRef.current;
        if (!preview) return;

        const deltaX = pointer.targetX - pointer.x;
        pointer.x += deltaX * .12;
        pointer.y += (pointer.targetY - pointer.y) * .12;
        const tilt = Math.max(-10, Math.min(10, deltaX * .08));

        preview.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) rotate(${tilt}deg)`;

        const isMoving = Math.abs(deltaX) > .3 || Math.abs(pointer.targetY - pointer.y) > .3;
        pointer.frame = isMoving ? requestAnimationFrame(render) : 0;
    };

    const handlePointerMove = (event) => {
        if (event.pointerType !== 'mouse') return;

        const board = boardRef.current;
        const pointer = pointerRef.current;
        const rect = board.getBoundingClientRect();

        pointer.targetX = event.clientX - rect.left;
        pointer.targetY = event.clientY - rect.top;

        if (!pointer.started) {
            pointer.x = pointer.targetX;
            pointer.y = pointer.targetY;
            pointer.started = true;
            previewRef.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
        }

        if (!pointer.frame) pointer.frame = requestAnimationFrame(render);
    };

    const handlePointerLeave = () => {
        pointerRef.current.started = false;
        setActive(null);
    };

    return (
        <>
            <section className={`section winners__section container${inView ? ' is-inview' : ''}`} id="winners" ref={sectionRef}>
                <header className="section__header">
                    <h3 className="section__header-title">Победители FLAY 2025</h3>
                </header>

                <div
                    className={`winners${active !== null ? ' is-hovering' : ''}${isExpanded ? ' is-expanded' : ''}`}
                    ref={boardRef}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                >
                    <ol className="winners__list">
                        {winners.map((winner, index) => (
                            <li
                                className={`winners__row${active === index ? ' is-active' : ''}`}
                                key={winner.nomination}
                                style={{ '--i': index }}
                                onPointerEnter={(event) => event.pointerType === 'mouse' && setActive(index)}
                            >
                                <span className="winners__index">{pad(index + 1)}</span>

                                <span className="winners__thumb">
                                    <img src={winner.image} width={56} height={72} loading="lazy" alt="" className="winners__thumb-image"/>
                                </span>

                                <span className="winners__text">
                                    <span className="winners__nomination">{winner.nomination}</span>
                                    <span className="winners__name">{winner.name}</span>
                                </span>
                            </li>
                        ))}
                    </ol>

                    <button type="button" className="winners__more" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded}>
                        {isExpanded ? 'Свернуть' : `Показать всех победителей (${winners.length})`}
                    </button>

                    <div className="winners__preview" ref={previewRef} aria-hidden="true">
                        <div className="winners__preview-frame">
                            {winners.map((winner, index) => (
                                <img
                                    key={winner.nomination}
                                    src={winner.image}
                                    width={240}
                                    height={300}
                                    loading="lazy"
                                    alt=""
                                    className={`winners__preview-image${active === index ? ' is-active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
