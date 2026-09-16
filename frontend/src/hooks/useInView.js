import { useEffect, useRef, useState } from 'react';

export default function useInView({ rootMargin = '0px 0px -15% 0px' } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setInView(true);
            observer.disconnect();
        }, { rootMargin });

        observer.observe(element);

        return () => observer.disconnect();
    }, [rootMargin]);

    return [ref, inView];
}
