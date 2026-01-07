import { RequestAuth } from '../types/http';

/**
 * Resolves which auth to use for a request based on inheritance rules
 *
 * @param requestAuth - Auth defined on the request itself
 * @param collectionAuth - Auth defined on the parent collection
 * @returns The resolved auth to use
 *
 * Rules:
 * 1. If request has { type: "noauth" } → use no auth (explicit override)
 * 2. If request has explicit auth → use request auth
 * 3. If request has no auth → inherit collection auth
 */
export function resolveAuth(
    requestAuth: RequestAuth | undefined,
    collectionAuth: RequestAuth | undefined
): RequestAuth | undefined {
    // Rule 1: Explicit noauth overrides everything
    if (requestAuth?.type === 'noauth') {
        return undefined;
    }

    // Rule 2: If request has explicit auth, use it
    if (requestAuth && requestAuth.type) {
        return requestAuth;
    }

    // Rule 3: Inherit collection auth
    return collectionAuth;
}

/**
 * Check if auth is inherited from collection
 */
export function isAuthInherited(
    requestAuth: RequestAuth | undefined,
    collectionAuth: RequestAuth | undefined
): boolean {
    // If request has explicit auth (including noauth), it's not inherited
    if (requestAuth && requestAuth.type) {
        return false;
    }

    // If we're using collection auth, it's inherited
    return collectionAuth !== undefined;
}
