import { api } from '../api/client.js';
import createStore from './createStore.js';

const store = createStore({});

export const useVotes = () => store.use();

export const loadVotes = () => api('/votes/')
    .then((list) => store.set(Object.fromEntries(list.map((vote) => [vote.nomination, vote.candidate]))))
    .catch(() => null);

export const resetVotes = () => store.set({});

export const saveVote = async (nominationId, candidateId) => {
    await api('/votes/', { method: 'POST', body: { nomination: nominationId, candidate: candidateId } });
    store.set((votes) => ({ ...votes, [nominationId]: candidateId }));
};

export const removeVote = async (nominationId) => {
    await api(`/votes/${nominationId}/`, { method: 'DELETE' });
    store.set((votes) => Object.fromEntries(Object.entries(votes).filter(([key]) => Number(key) !== nominationId)));
};
