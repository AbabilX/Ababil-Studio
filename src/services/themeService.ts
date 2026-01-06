/**
 * Theme Service
 * 
 * Manages theme preferences and persistence
 */

export type Theme = 'system' | 'light' | 'dark';

const THEME_KEY = 'ababil_theme';

/**
 * Get the current theme preference from localStorage
 */
export function getTheme(): Theme {
    try {
        const theme = localStorage.getItem(THEME_KEY);
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
            return theme;
        }
    } catch {
        // localStorage not available
    }
    return 'system'; // Default to system
}

/**
 * Save theme preference to localStorage
 */
export function setTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // localStorage not available, ignore
    }
}

/**
 * Get the effective theme (resolves 'system' to actual light/dark)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
    const theme = getTheme();
    
    if (theme === 'system') {
        // Check system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }
        return 'light'; // Default to light if can't detect
    }
    
    return theme;
}

/**
 * Apply theme to document root
 */
export function applyTheme(theme: Theme): void {
    const effectiveTheme = theme === 'system' 
        ? getEffectiveTheme() 
        : theme;
    
    const root = document.documentElement;
    
    if (effectiveTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

