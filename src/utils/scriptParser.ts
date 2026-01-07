/**
 * Utility to parse Postman test scripts for variable assignments
 */

export interface TokenMapping {
    variableName: string;
    jsonPath: string; // Simplified path, e.g., "accessToken" or "data.token"
}

/**
 * Parses Postman scripts like:
 * pm.collectionVariables.set("access_token", jsonData.token);
 * pm.environment.set("user_id", jsonData.user.id);
 */
export function parseTokenMappings(script: string): TokenMapping[] {
    if (!script) return [];

    const mappings: TokenMapping[] = [];

    // Support pm.collectionVariables, pm.environment, pm.globals, postman.setEnvironmentVariable, etc.
    // Regex matches .set("name", value) or .setEnvironmentVariable("name", value)
    const setVariableRegex =
        /(?:pm\.(?:collectionVariables|environment|globals|variables)\.set|postman\.set(?:Environment|Global)Variable)\s*\(\s*["']([^"']+)["']\s*,\s*([^)]+)\s*\)/g;

    let match;
    while ((match = setVariableRegex.exec(script)) !== null) {
        const variableName = match[1];
        const valueExpression = match[2].trim();

        // Try to extract the JSON path from common patterns like jsonData.path.to.token
        // We look for everything after "jsonData." or just the full expression if it's simple
        const jsonPathMatch = /jsonData\.([a-zA-Z0-9_.]+)/.exec(
            valueExpression
        );
        const jsonPath = jsonPathMatch ? jsonPathMatch[1] : valueExpression;

        // Clean up jsonPath (remove semicolons if any, though regex should avoid them)
        const cleanPath = jsonPath.replace(/;$/, '').trim();

        mappings.push({
            variableName,
            jsonPath: cleanPath,
        });
    }

    return mappings;
}

/**
 * Extracts a value from a JSON object using a dot-notation path
 */
export function getValueByPath(obj: any, path: string): any {
    if (!path || !obj) return undefined;

    // If it's just a variable name like "token", try to find it at top level
    if (!path.includes('.')) {
        return obj[path];
    }

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === null || typeof current !== 'object') return undefined;
        current = current[part];
    }

    return current;
}
