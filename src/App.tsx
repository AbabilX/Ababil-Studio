import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomeLayout } from './components/layout/HomeLayout';

function App() {
    return (
        <ThemeProvider>
            <HomeLayout />
        </ThemeProvider>
    );
}

export default App;
