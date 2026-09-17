import { api } from '../api/client.js';
import createStore from './createStore.js';

const store = createStore(null);

export const loadVoting = () => api('/voting/').then(store.set).catch(() => null);

export const useVoting = () => store.use();

export const getVotingPhase = (voting, now = Date.now()) => {
    if (!voting?.starts_at || !voting?.ends_at || now < new Date(voting.starts_at).getTime()) return 'upcoming';
    if (now < new Date(voting.ends_at).getTime()) return 'active';
    return 'finished';
};

loadVoting();
