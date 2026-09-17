import { useSyncExternalStore } from 'react';

export default function createStore(initialState) {
    let state = initialState;
    const listeners = new Set();

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    return {
        get: () => state,
        set: (next) => {
            state = typeof next === 'function' ? next(state) : next;
            listeners.forEach((listener) => listener());
        },
        use: () => useSyncExternalStore(subscribe, () => state),
    };
}
