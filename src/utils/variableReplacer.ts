import { Environment } from '../types/environment';
import { AuthToken } from '../types/auth';
import { RequestAuth } from '../types/http';
import { replaceVariables } from '../services/environmentService';

/**
 * Replace variables in a text string
 * Returns both the original text and the resolved text
 */
export function replaceVariablesInText(
    text: string,
    environment: Environment | null
): { original: string; resolved: string } {
    const resolved = replaceVariables(text, environment);
    return {
        original: text,
        resolved,
    };
}

/**
 * Replace variables in URL, handling both raw URLs and structured URLs
 */
export function replaceVariablesInUrl(
    url: string | { raw?: string; protocol?: string; host?: string[]; path?: string[]; query?: any[] } | undefined,
    environment: Environment | null,
    authTokens: AuthToken[] = []
): string {
    if (!url) return '';

    // If it's a string, replace directly
    if (typeof url === 'string') {
        return replaceVariablesInTextString(url, environment, authTokens);
    }

    // If it's an object with raw, use raw
    if (url.raw) {
        return replaceVariablesInTextString(url.raw, environment, authTokens);
    }

    // Otherwise construct from parts
    const protocol = url.protocol || 'http';
    const host = url.host?.join('.') || '';
    const path = url.path?.join('/') || '';
    const query = url.query
        ?.filter((q: any) => !q.disabled && q.value)
        .map((q: any) => {
            const key = replaceVariablesInTextString(q.key, environment, authTokens);
            const value = replaceVariablesInTextString(q.value || '', environment, authTokens);
            return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');

    const constructedUrl = `${protocol}://${host}${path ? '/' + path : ''}${query ? '?' + query : ''}`;
    return replaceVariablesInTextString(constructedUrl, environment, authTokens);
}

/**
 * Replace variables in text, checking both environment variables and auth tokens
 * Auth tokens take precedence over environment variables
 * Internal helper function
 */
function replaceVariablesInTextString(
    text: string,
    environment: Environment | null,
    authTokens: AuthToken[] = []
): string {
    if (!text) return text;

    let result = text;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    let match: RegExpExecArray | null;
    const replacements = new Map<string, string>();

    // First pass: collect all unique variables and their values
    while ((match = variablePattern.exec(text)) !== null) {
        const varName = match[1].trim();
        if (!replacements.has(varName)) {
            // Check auth tokens first (higher priority)
            const authToken = authTokens.find((t) => t.name === varName);
            if (authToken) {
                replacements.set(varName, authToken.value);
            } else if (environment) {
                // Then check environment variables
                const variable = environment.variables.find(
                    (v) => v.key === varName && !v.disabled
                );
                if (variable) {
                    replacements.set(varName, variable.value);
                }
            }
        }
    }

    // Second pass: replace all occurrences of each variable
    replacements.forEach((value, varName) => {
        const regex = new RegExp(`\\{\\{\\s*${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g');
        result = result.replace(regex, value);
    });

    return result;
}

/**
 * Recursively replace variables in a JSON object
 */
function replaceVariablesInObject(
    obj: any,
    environment: Environment | null,
    authTokens: AuthToken[] = []
): any {
    if (typeof obj === 'string') {
        return replaceVariablesInTextString(obj, environment, authTokens);
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => replaceVariablesInObject(item, environment, authTokens));
    }
    if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = replaceVariablesInObject(value, environment, authTokens);
        }
        return result;
    }
    return obj;
}

/**
 * Replace variables in request body, handling nested JSON
 */
export function replaceVariablesInBody(
    body: string | undefined,
    environment: Environment | null,
    authTokens: AuthToken[] = []
): string {
    if (!body) return '';

    // Try to parse as JSON to handle nested structures
    try {
        const parsed = JSON.parse(body);
        const replaced = replaceVariablesInObject(parsed, environment, authTokens);
        return JSON.stringify(replaced);
    } catch {
        // Not JSON, treat as plain text
        return replaceVariablesInTextString(body, environment, authTokens);
    }
}

/**
 * Replace variables in headers object
 */
export function replaceVariablesInHeaders(
    headers: Record<string, string> | undefined,
    environment: Environment | null,
    authTokens: AuthToken[] = []
): Record<string, string> {
    if (!headers) return {};

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        result[replaceVariablesInTextString(key, environment, authTokens)] = replaceVariablesInTextString(
            value,
            environment,
            authTokens
        );
    }
    return result;
}

/**
 * Replace variables in auth object
 */
export function replaceVariablesInAuth(
    auth: RequestAuth | undefined,
    environment: Environment | null,
    authTokens: AuthToken[] = []
): RequestAuth | undefined {
    if (!auth) return undefined;

    const result: RequestAuth = {
        ...auth,
    };

    // Replace variables in bearer tokens
    if (auth.bearer) {
        result.bearer = auth.bearer.map((varItem) => ({
            ...varItem,
            value: replaceVariablesInTextString(varItem.value, environment, authTokens),
        }));
    }

    // Replace variables in basic auth
    if (auth.basic) {
        result.basic = auth.basic.map((varItem) => ({
            ...varItem,
            value: replaceVariablesInTextString(varItem.value, environment, authTokens),
        }));
    }

    // Replace variables in API keys
    if (auth.apikey) {
        result.apikey = auth.apikey.map((varItem) => ({
            ...varItem,
            value: replaceVariablesInTextString(varItem.value, environment, authTokens),
        }));
    }

    return result;
}

