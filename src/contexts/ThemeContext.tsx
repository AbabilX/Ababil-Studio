import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    Theme,
    getTheme,
    setTheme as saveTheme,
    getEffectiveTheme,
    applyTheme,
} from '../services/themeService';

interface ThemeContextType {
    theme: Theme;
    effectiveTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const initialTheme = getTheme();
    const [theme, setThemeState] = useState<Theme>(initialTheme);
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
        getEffectiveTheme
    );

    // Apply theme immediately on mount
    useEffect(() => {
        applyTheme(initialTheme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Apply theme when theme changes
    useEffect(() => {
        applyTheme(theme);
        setEffectiveTheme(getEffectiveTheme());
    }, [theme]);

    // Listen for system theme changes when theme is 'system'
    useEffect(() => {
        if (theme !== 'system') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            const newEffectiveTheme = e.matches ? 'dark' : 'light';
            setEffectiveTheme(newEffectiveTheme);
            applyTheme('system');
        };

        // Set initial value
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        saveTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

