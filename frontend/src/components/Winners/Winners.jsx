import { useCallback, useEffect, useRef, useState } from 'react';
import { winners } from '../../data/winners.js';

export default function Winners() {
    const listRef = useRef(null);
    const progressRef = useRef(null);
    const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
    const progressDragRef = useRef(false);
    const [thumb, setThumb] = useState({ width: 100, offset: 0 });
    const [dragging, setDragging] = useState(false);
    const [scrubbing, setScrubbing] = useState(false);

    const updateThumb = useCallback(() => {
        const list = listRef.current;
        if (!list) return;

        const { clientWidth, scrollWidth, scrollLeft } = list;
        const visible = scrollWidth > 0 ? (clientWidth / scrollWidth) * 100 : 100;
        const maxScroll = scrollWidth - clientWidth;
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

        setThumb({ width: visible, offset: progress * (100 - visible) });
    }, []);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        updateThumb();

        const observer = new ResizeObserver(updateThumb);
        observer.observe(list);
        Array.from(list.children).forEach((item) => observer.observe(item));
        window.addEventListener('resize', updateThumb);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateThumb);
        };
    }, [updateThumb]);

    const handlePointerDown = (event) => {
        if (event.pointerType !== 'mouse') return;

        const list = listRef.current;
        dragRef.current = { active: true, startX: event.clientX, startScroll: list.scrollLeft, moved: false };
        setDragging(true);
        list.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const drag = dragRef.current;
        if (!drag.active) return;

        const delta = event.clientX - drag.startX;
        if (Math.abs(delta) > 3) drag.moved = true;
        listRef.current.scrollLeft = drag.startScroll - delta;
    };

    const handlePointerUp = (event) => {
        const drag = dragRef.current;
        if (!drag.active) return;

        const list = listRef.current;
        drag.active = false;
        setDragging(false);

        if (list.hasPointerCapture(event.pointerId)) {
            list.releasePointerCapture(event.pointerId);
        }
    };

    const handleClickCapture = (event) => {
        if (dragRef.current.moved) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const scrollToPointer = (clientX, smooth) => {
        const list = listRef.current;
        const track = progressRef.current;
        if (!list || !track) return;

        const maxScroll = list.scrollWidth - list.clientWidth;
        if (maxScroll <= 0) return;

        const rect = track.getBoundingClientRect();
        const thumbWidth = rect.width * (list.clientWidth / list.scrollWidth);
        const usable = rect.width - thumbWidth;
        const ratio = usable > 0 ? (clientX - rect.left - thumbWidth / 2) / usable : 0;

        list.scrollTo({
            left: Math.min(Math.max(ratio, 0), 1) * maxScroll,
            behavior: smooth ? 'smooth' : 'auto',
        });
    };

    const handleProgressDown = (event) => {
        progressDragRef.current = true;
        setScrubbing(true);
        scrollToPointer(event.clientX, true);
        progressRef.current.setPointerCapture(event.pointerId);
    };

    const handleProgressMove = (event) => {
        if (!progressDragRef.current) return;
        scrollToPointer(event.clientX, false);
    };

    const handleProgressUp = (event) => {
        if (!progressDragRef.current) return;

        const track = progressRef.current;
        progressDragRef.current = false;
        setScrubbing(false);

        if (track.hasPointerCapture(event.pointerId)) {
            track.releasePointerCapture(event.pointerId);
        }
    };

    return (
        <>
            <section className="section winners__section container" id="winners">
                <header className="section__header">
                    <h3 className="section__header-title">Победители FLAY 2025</h3>
                </header>

                <div className="winners">
                    <div className="winners__inner">
                        <ul
                            className={`winners__list ${dragging ? 'winners__list--dragging' : ''} ${scrubbing ? 'winners__list--free' : ''}`}
                            ref={listRef}
                            onScroll={updateThumb}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            onClickCapture={handleClickCapture}
                        >
                            {winners.map((winner) => (
                                <li className="winners__item" key={winner.nomination}>
                                    <div className="winners__image-wrapper">
                                        <img src={winner.image} width={270} height={350} loading={'lazy'} alt={winner.name} className="winners__image"/>
                                    </div>
                                    <span className="winners__nomination">{winner.nomination}</span>
                                    <h1 className="winners__name">{winner.name}</h1>
                                </li>
                            ))}
                        </ul>

                        <div
                            className={`winners__progress ${scrubbing ? 'winners__progress--active' : ''}`}
                            ref={progressRef}
                            onPointerDown={handleProgressDown}
                            onPointerMove={handleProgressMove}
                            onPointerUp={handleProgressUp}
                            onPointerCancel={handleProgressUp}
                        >
                            <span
                                className="winners__progress-thumb"
                                style={{ width: `${thumb.width}%`, left: `${thumb.offset}%` }}
                            />
                        </div>
                    </div>
                </div>

            </section>
        </>
    );
}