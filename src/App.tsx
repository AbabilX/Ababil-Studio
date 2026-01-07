import React from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomeLayout } from './components/layout/HomeLayout';
import { SplashScreen } from './components/SplashScreen';

function App() {
    const [showSplash, setShowSplash] = React.useState(false);

    React.useEffect(() => {
        // Check if splash screen is enabled in settings (default true)
        const isSplashEnabled = localStorage.getItem('showSplash') !== 'false';

        if (isSplashEnabled) {
            setShowSplash(true);
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <ThemeProvider>
            {showSplash && <SplashScreen />}
            <HomeLayout />
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}

export default App;
