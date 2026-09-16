import { useEffect, useRef } from 'react';

const ZONES = '.header, .hero, .nominees-modal';

export default function CursorGlow() {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
        if (!element || !media.matches) return;

        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        let frame = 0;
        let started = false;

        const render = () => {
            x += (targetX - x) * .08;
            y += (targetY - y) * .08;
            element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

            frame = Math.abs(targetX - x) > .5 || Math.abs(targetY - y) > .5
                ? requestAnimationFrame(render)
                : 0;
        };

        const handleMove = (event) => {
            targetX = event.clientX;
            targetY = event.clientY;

            if (!started) {
                x = targetX;
                y = targetY;
                started = true;
            }

            element.classList.toggle('is-active', Boolean(event.target.closest?.(ZONES)));
            if (!frame) frame = requestAnimationFrame(render);
        };

        const handleLeave = () => element.classList.remove('is-active');

        window.addEventListener('pointermove', handleMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', handleLeave);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', handleMove);
            document.documentElement.removeEventListener('pointerleave', handleLeave);
        };
    }, []);

    return <div className="cursor-glow" ref={ref} aria-hidden="true" />;
}
