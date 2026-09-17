import { api, getTokens, onSessionExpired, setTokens } from '../api/client.js';
import createStore from './createStore.js';
import { loadVotes, resetVotes } from './votes.js';

const hasTokens = () => Boolean(getTokens().access || getTokens().refresh);

const store = createStore({ user: null, status: hasTokens() ? 'loading' : 'guest' });

const clearSession = () => {
    setTokens();
    resetVotes();
    store.set({ user: null, status: 'guest' });
};

const startSession = (data) => {
    setTokens(data);
    store.set({ user: data.user, status: 'authenticated' });
    loadVotes();
    return data.user;
};

export const useAuth = () => store.use();

export const loadSession = async () => {
    if (!hasTokens()) {
        clearSession();
        return;
    }

    try {
        const user = await api('/auth/me/');
        store.set({ user, status: 'authenticated' });
        loadVotes();
    } catch {
        clearSession();
    }
};

export const loginWithTelegram = async (payload) => startSession(
    await api('/auth/telegram/', { method: 'POST', body: payload }),
);

export const logout = async () => {
    const { refresh } = getTokens();
    if (refresh) await api('/auth/logout/', { method: 'POST', body: { refresh } }).catch(() => null);
    clearSession();
};

onSessionExpired(clearSession);
loadSession();
