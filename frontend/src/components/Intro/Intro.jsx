import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import LogoMark from '../LogoMark/LogoMark.jsx';

const MIN_DURATION = 1800;
const MAX_DURATION = 6000;
const LEAVE_DURATION = 1150;
const STORAGE_KEY = 'flay-intro-played';

const shouldPlay = () => {
    if (window.location.pathname !== '/') return false;
    if (document.hidden) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

    try {
        return !sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return true;
    }
};

const markPlayed = () => {
    try {
        sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
        return;
    }
};

const waitForAssets = (onProgress) => {
    const images = [...document.querySelectorAll('.header img, .hero img')];
    const tasks = [
        document.fonts?.ready ?? Promise.resolve(),
        ...images.map((image) => (
            image.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    image.addEventListener('load', resolve, { once: true });
                    image.addEventListener('error', resolve, { once: true });
                })
        )),
    ];

    let done = 0;
    tasks.forEach((task) => task.then(() => onProgress(++done / tasks.length)));
};

export default function Intro() {
    const [phase, setPhase] = useState(() => (shouldPlay() ? 'playing' : 'done'));
    const [progress, setProgress] = useState(0);
    const logoRef = useRef(null);

    useLayoutEffect(() => {
        document.documentElement.dataset.intro = phase;
    }, [phase]);

    useEffect(() => {
        if (phase !== 'playing') return;

        const previousOverflow = document.body.style.overflow;
        const previousRestoration = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        let loaded = 0;
        let frame = 0;
        const start = performance.now();

        waitForAssets((ratio) => {
            loaded = ratio;
        });

        const tick = (now) => {
            const elapsed = now - start;
            const real = elapsed > MAX_DURATION ? 1 : loaded;
            const value = Math.min(real, elapsed / MIN_DURATION);
            setProgress(value);

            if (value >= 1) {
                setTimeout(() => setPhase('leaving'), 250);
                return;
            }

            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            history.scrollRestoration = previousRestoration;
        };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'leaving') return;

        const logo = logoRef.current;
        const target = document.querySelector('.header__logo .logo__image');

        if (logo && target) {
            const from = logo.getBoundingClientRect();
            const to = target.getBoundingClientRect();
            const x = to.left + to.width / 2 - (from.left + from.width / 2);
            const y = to.top + to.height / 2 - (from.top + from.height / 2);
            logo.style.transform = `translate(${x}px, ${y}px) scale(${to.width / from.width})`;
        }

        markPlayed();
        const timer = setTimeout(() => setPhase('done'), LEAVE_DURATION);

        return () => clearTimeout(timer);
    }, [phase]);

    if (phase === 'done') return null;

    const percent = String(Math.round(progress * 100)).padStart(3, '0');

    return (
        <>
            <div className={`intro${phase === 'leaving' ? ' is-leaving' : ''}`} role="status" aria-label="Загрузка сайта">
                <div className="intro__curtain intro__curtain--accent" />

                <div className="intro__curtain intro__curtain--dark">
                    <span className="intro__caption">FLAY 2026 • Eternity</span>

                    <span className="intro__counter" style={{ '--progress': progress }} aria-hidden="true">
                        <span className="intro__counter-outline">{percent}</span>
                        <span className="intro__counter-fill">{percent}</span>
                    </span>
                </div>

                <div className="intro__logo" ref={logoRef}>
                    <LogoMark className="intro__logo-image" assemble />
                </div>
            </div>
        </>
    );
}
