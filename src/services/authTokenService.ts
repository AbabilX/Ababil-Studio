import { AuthToken } from '../types/auth';

const AUTH_TOKENS_KEY = 'ababil_auth_tokens';

// Auth token operations
export function saveToken(
    token: Omit<AuthToken, 'id' | 'createdAt' | 'updatedAt'>
): AuthToken {
    const tokens = loadTokens();
    const now = Date.now();
    const newToken: AuthToken = {
        ...token,
        id: `token_${now}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
    };

    tokens.push(newToken);
    localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    return newToken;
}

export function loadTokens(): AuthToken[] {
    try {
        const data = localStorage.getItem(AUTH_TOKENS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function updateToken(
    id: string,
    updates: Partial<Omit<AuthToken, 'id' | 'createdAt'>>
): AuthToken | null {
    const tokens = loadTokens();
    const index = tokens.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tokens[index] = {
        ...tokens[index],
        ...updates,
        updatedAt: Date.now(),
    };
    localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    return tokens[index];
}

export function deleteToken(id: string): boolean {
    const tokens = loadTokens();
    const filtered = tokens.filter((t) => t.id !== id);
    if (filtered.length === tokens.length) return false;

    localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(filtered));
    return true;
}

export function getToken(id: string): AuthToken | null {
    const tokens = loadTokens();
    return tokens.find((t) => t.id === id) || null;
}

export function getTokenByName(name: string): AuthToken | null {
    const tokens = loadTokens();
    return tokens.find((t) => t.name === name) || null;
}

