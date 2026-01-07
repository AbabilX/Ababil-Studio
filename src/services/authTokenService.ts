import { AuthToken } from '../types/auth';

// In-memory token storage - tokens are cleared on app restart (like Postman)
let memoryTokens: AuthToken[] = [];

// Auth token operations (in-memory, ephemeral storage)
export function saveToken(
    token: Omit<AuthToken, 'id' | 'createdAt' | 'updatedAt'>
): AuthToken {
    const now = Date.now();
    const newToken: AuthToken = {
        ...token,
        id: `token_${now}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
    };

    // Check if token with same name exists, update it instead of adding duplicate
    const existingIndex = memoryTokens.findIndex((t) => t.name === token.name);
    if (existingIndex !== -1) {
        memoryTokens[existingIndex] = newToken;
    } else {
        memoryTokens.push(newToken);
    }

    return newToken;
}

export function loadTokens(): AuthToken[] {
    return [...memoryTokens]; // Return a copy to prevent external mutation
}

export function updateToken(
    id: string,
    updates: Partial<Omit<AuthToken, 'id' | 'createdAt'>>
): AuthToken | null {
    const index = memoryTokens.findIndex((t) => t.id === id);
    if (index === -1) return null;

    memoryTokens[index] = {
        ...memoryTokens[index],
        ...updates,
        updatedAt: Date.now(),
    };
    return memoryTokens[index];
}

export function deleteToken(id: string): boolean {
    const initialLength = memoryTokens.length;
    memoryTokens = memoryTokens.filter((t) => t.id !== id);
    return memoryTokens.length < initialLength;
}

export function getToken(id: string): AuthToken | null {
    return memoryTokens.find((t) => t.id === id) || null;
}

export function getTokenByName(name: string): AuthToken | null {
    return memoryTokens.find((t) => t.name === name) || null;
}

// Clear all tokens (useful for logout)
export function clearAllTokens(): void {
    memoryTokens = [];
}
