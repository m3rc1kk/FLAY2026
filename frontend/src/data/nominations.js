import { api } from '../api/client.js';
import createStore from './createStore.js';

const store = createStore({ items: [], status: 'loading' });

const toNomination = (nomination, index) => ({
    id: nomination.id,
    number: index + 1,
    title: nomination.title,
    description: nomination.description,
    nominees: nomination.candidates.map((candidate, candidateIndex) => ({
        id: candidate.id,
        number: candidateIndex + 1,
        name: candidate.name,
        image: candidate.photo ?? undefined,
    })),
});

export const loadNominations = () => api('/nominations/')
    .then((list) => store.set({ items: list.map(toNomination), status: 'ready' }))
    .catch(() => store.set((state) => ({ ...state, status: 'error' })));

export const useNominations = () => store.use();

export const findNomination = (nominations, id) =>
    nominations.find((nomination) => nomination.id === Number(id));

loadNominations();
