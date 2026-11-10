import { api } from '../api/client.js';
import createStore from './createStore.js';

const store = createStore({});

export const usePredictions = () => store.use();

export const loadPredictions = () => api('/predictions/')
    .then((list) => store.set(Object.fromEntries(list.map((prediction) => [prediction.nomination, prediction.candidate]))))
    .catch(() => null);

export const resetPredictions = () => store.set({});

export const savePrediction = async (nominationId, candidateId) => {
    await api('/predictions/', { method: 'POST', body: { nomination: nominationId, candidate: candidateId } });
    store.set((predictions) => ({ ...predictions, [nominationId]: candidateId }));
};

export const removePrediction = async (nominationId) => {
    await api(`/predictions/${nominationId}/`, { method: 'DELETE' });
    store.set((predictions) => Object.fromEntries(Object.entries(predictions).filter(([key]) => Number(key) !== nominationId)));
};
