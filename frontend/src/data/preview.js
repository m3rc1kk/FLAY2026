import { api } from '../api/client.js';
import createStore from './createStore.js';
import { loadNominations } from './nominations.js';
import { loadVoting } from './voting.js';

const store = createStore(null);

export const loadPreview = () => {
    store.set(null);
    return api('/auth/preview/')
        .then((preview) => {
            store.set(preview);
            if (preview.closed && preview.allowed) {
                loadNominations();
                loadVoting();
            }
        })
        .catch(() => store.set({ closed: false, allowed: true }));
};

export const usePreview = () => store.use();
