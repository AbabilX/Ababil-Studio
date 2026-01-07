import { HttpResponse } from '../types/http';
import { AuthToken } from '../types/auth';

/**
 * Common token field names to look for in response bodies
 */
const TOKEN_FIELD_NAMES = [
    'token',
    'access_token',
    'accessToken',
    'authToken',
    'bearerToken',
    'bearer_token',
    'apiKey',
    'api_key',
    'apikey',
    'api_token',
    'apiToken',
    'jwt',
    'jwtToken',
    'refresh_token',
    'refreshToken',
    'sessionToken',
    'session_token',
];

/**
 * Recursively search for token fields in an object
 */
function findTokenFields(
    obj: any,
    path: string = '',
    results: Array<{ name: string; value: string; path: string }> = []
): Array<{ name: string; value: string; path: string }> {
    if (!obj || typeof obj !== 'object') {
        return results;
    }

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();

        // Check if this key matches a known token field name
        if (
            typeof value === 'string' &&
            value.length > 0 &&
            TOKEN_FIELD_NAMES.some((tokenName) =>
                lowerKey.includes(tokenName.toLowerCase())
            )
        ) {
            results.push({
                name: key,
                value: value as string,
                path: currentPath,
            });
        }

        // Recursively search nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            findTokenFields(value, currentPath, results);
        } else if (Array.isArray(value)) {
            // Check array items if they're objects
            value.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    findTokenFields(item, `${currentPath}[${index}]`, results);
                }
            });
        }
    }

    return results;
}

/**
 * Extract potential tokens from HTTP response body
 */
export function extractTokensFromResponse(
    response: HttpResponse
): Array<{
    name: string;
    value: string;
    path: string;
    suggestedTokenName: string;
}> {
    if (
        !response.body ||
        response.status_code < 200 ||
        response.status_code >= 300
    ) {
        return [];
    }

    try {
        const parsed = JSON.parse(response.body);
        const tokenFields = findTokenFields(parsed);

        return tokenFields.map((field) => {
            const lowerName = field.name.toLowerCase();
            let suggestedName: string;

            // Map common token field names to Postman-style variable names
            // This ensures extracted tokens match what's used in collection auth
            if (
                lowerName === 'accesstoken' ||
                lowerName === 'access_token' ||
                lowerName === 'token' ||
                lowerName === 'authtoken'
            ) {
                suggestedName = 'user_token'; // Match {{user_token}} in Postman
            } else if (
                lowerName === 'refreshtoken' ||
                lowerName === 'refresh_token'
            ) {
                suggestedName = 'refresh_token'; // Match {{refresh_token}} in Postman
            } else if (
                lowerName.includes('token') ||
                lowerName.includes('key')
            ) {
                // Keep original name for other tokens, just normalize
                suggestedName = lowerName.replace(/[^a-z0-9]/g, '_');
            } else {
                suggestedName = lowerName.replace(/[^a-z0-9]/g, '_');
            }

            return {
                ...field,
                suggestedTokenName: suggestedName,
            };
        });
    } catch {
        // Not JSON, return empty array
        return [];
    }
}

/**
 * Convert extracted token fields to AuthToken objects (without IDs)
 */
export function extractedTokensToAuthTokens(
    extracted: Array<{
        name: string;
        value: string;
        path: string;
        suggestedTokenName: string;
    }>
): Array<Omit<AuthToken, 'id' | 'createdAt' | 'updatedAt'>> {
    return extracted.map((token) => ({
        name: token.suggestedTokenName,
        value: token.value,
        source: 'extracted' as const,
    }));
}
