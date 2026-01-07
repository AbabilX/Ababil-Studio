import { HttpRequest, RequestAuth } from './http';

export interface SavedRequest {
    id: string;
    name: string;
    method: string;
    url: string;
    body?: string;
    headers?: Record<string, string>;
    auth?: RequestAuth;
    testScript?: string;
    collectionId?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Collection {
    id: string;
    name: string;
    requests: string[]; // request IDs
    collections?: string[]; // nested collection IDs (optional for future)
    auth?: RequestAuth; // collection-level auth (inherited by requests)
    createdAt: number;
    updatedAt: number;
}

// Helper to convert SavedRequest to HttpRequest
export function savedRequestToHttpRequest(saved: SavedRequest): HttpRequest {
    return {
        method: saved.method,
        url: { raw: saved.url },
        header: saved.headers
            ? Object.entries(saved.headers).map(([key, value]) => ({
                  key,
                  value,
              }))
            : undefined,
        body: saved.body ? { mode: 'raw', raw: saved.body } : undefined,
        auth: saved.auth,
        testScript: saved.testScript,
    };
}

// Helper to convert HttpRequest to SavedRequest
export function httpRequestToSavedRequest(
    request: HttpRequest,
    name: string,
    collectionId?: string
): Omit<SavedRequest, 'id' | 'createdAt' | 'updatedAt'> {
    return {
        name,
        method: request.method || 'GET',
        url: request.url?.raw || '',
        body: request.body?.raw,
        headers: request.header
            ? Object.fromEntries(request.header.map((h) => [h.key, h.value]))
            : undefined,
        auth: request.auth,
        testScript: request.testScript,
        collectionId,
    };
}
