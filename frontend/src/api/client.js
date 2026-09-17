const API_URL = '/api/v1';
const ACCESS_KEY = 'flay-access';
const REFRESH_KEY = 'flay-refresh';

const storage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key, value) {
        try {
            if (value) {
                localStorage.setItem(key, value);
            } else {
                localStorage.removeItem(key);
            }
        } catch {
            return;
        }
    },
};

export class ApiError extends Error {
    constructor(status, data) {
        super(data?.detail ?? `Request failed with status ${status}`);
        this.status = status;
        this.code = data?.code ?? null;
        this.data = data;
    }
}

export const getTokens = () => ({ access: storage.get(ACCESS_KEY), refresh: storage.get(REFRESH_KEY) });

export const setTokens = ({ access = null, refresh = null } = {}) => {
    storage.set(ACCESS_KEY, access);
    storage.set(REFRESH_KEY, refresh);
};

let refreshing = null;
let expiredHandler = null;

export const onSessionExpired = (handler) => {
    expiredHandler = handler;
};

const refreshTokens = () => {
    if (refreshing) return refreshing;

    const { refresh } = getTokens();
    if (!refresh) return Promise.resolve(false);

    refreshing = fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
    })
        .then(async (response) => {
            if (!response.ok) throw new ApiError(response.status, null);
            setTokens(await response.json());
            return true;
        })
        .catch(() => {
            setTokens();
            expiredHandler?.();
            return false;
        })
        .finally(() => {
            refreshing = null;
        });

    return refreshing;
};

export async function api(path, { method = 'GET', body, retry = true } = {}) {
    const { access } = getTokens();
    const isForm = body instanceof FormData;
    const headers = {};
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
    if (access) headers.Authorization = `Bearer ${access}`;

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body === undefined || isForm ? body : JSON.stringify(body),
    });

    if (response.status === 401 && access && retry) {
        await refreshTokens();
        return api(path, { method, body, retry: false });
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, data);
    return data;
}
