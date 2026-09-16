import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'flay-votes';
const listeners = new Set();

const read = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
};

let votes = read();

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const saveVote = (nominationNumber, nomineeNumber) => {
    votes = { ...votes, [nominationNumber]: nomineeNumber };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch {
        return;
    } finally {
        listeners.forEach((listener) => listener());
    }
};

export const useVotes = () => useSyncExternalStore(subscribe, () => votes);
