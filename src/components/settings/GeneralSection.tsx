import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useState, useEffect } from 'react';

export function GeneralSection() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('showSplash');
        if (stored !== null) {
            setShowSplash(stored !== 'false');
        }
    }, []);

    const handleSplashToggle = (checked: boolean) => {
        setShowSplash(checked);
        localStorage.setItem('showSplash', String(checked));
    };

    return (
        <div className="h-full overflow-y-auto bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4">General</h1>
                    <p className="text-muted-foreground">
                        Manage general application settings.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-0.5">
                            <Label className="text-base">
                                Show Splash Screen
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Display the splash screen on application startup
                                and refresh.
                            </p>
                        </div>
                        <Switch
                            checked={showSplash}
                            onCheckedChange={handleSplashToggle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
