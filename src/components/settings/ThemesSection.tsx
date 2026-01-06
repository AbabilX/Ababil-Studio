import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemesSection() {
    const { theme, effectiveTheme, setTheme } = useTheme();
    const [isManual, setIsManual] = useState(theme !== 'system');
    const [manualTheme, setManualTheme] = useState<'light' | 'dark'>(
        theme === 'system' ? effectiveTheme : theme
    );

    // Sync manual theme when theme changes externally
    useEffect(() => {
        if (theme !== 'system') {
            setManualTheme(theme);
        }
    }, [theme]);

    const handleModeChange = (value: string) => {
        if (value === 'system') {
            setIsManual(false);
            setTheme('system');
        } else {
            setIsManual(true);
            setTheme(manualTheme);
        }
    };

    const handleDayThemeChange = (value: string) => {
        setManualTheme(value as 'light' | 'dark');
        setTheme(value as 'light' | 'dark');
    };

    const handleNightThemeChange = (value: string) => {
        setManualTheme(value as 'light' | 'dark');
        setTheme(value as 'light' | 'dark');
    };

    const isDayActive = effectiveTheme === 'light';
    const isNightActive = effectiveTheme === 'dark';

    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="max-w-6xl mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Themes</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Personalize your experience with themes that match
                            your style. Manually select a theme or sync with
                            system settings and let the machine set your day and
                            night themes.
                        </p>
                    </div>
                </div>

                {/* Theme Selection Mode */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">
                        Theme selection
                    </Label>
                    <RadioGroup
                        value={isManual ? 'manual' : 'system'}
                        onValueChange={handleModeChange}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="system" id="system" />
                            <Label
                                htmlFor="system"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Sync with system
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="manual" />
                            <Label
                                htmlFor="manual"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Manual
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Theme Preview Cards */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Day Theme Card */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sun className="w-5 h-5" />
                            <h3 className="text-lg font-semibold">
                                Day Theme
                            </h3>
                            {isDayActive && (
                                <Badge
                                    variant="default"
                                    className="ml-auto bg-blue-500 hover:bg-blue-500"
                                >
                                    ACTIVE
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Active when system is set to light.
                        </p>

                        {/* Preview Window */}
                        <div className="border border-border rounded-lg overflow-hidden bg-white shadow-lg">
                            <div className="bg-gray-100 border-b border-border px-3 py-2 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="pt-2">
                                    <div className="h-8 bg-blue-500 rounded w-24"></div>
                                </div>
                            </div>
                        </div>

                        {/* Theme Selector */}
                        <Select
                            value={isManual ? manualTheme : 'light'}
                            disabled={!isManual}
                            onValueChange={handleDayThemeChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>Light</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Night Theme Card */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Moon className="w-5 h-5" />
                            <h3 className="text-lg font-semibold">
                                Night Theme
                            </h3>
                            {isNightActive && (
                                <Badge
                                    variant="default"
                                    className="ml-auto bg-blue-500 hover:bg-blue-500"
                                >
                                    ACTIVE
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Active when system is set to dark.
                        </p>

                        {/* Preview Window */}
                        <div className="border border-border rounded-lg overflow-hidden bg-gray-900 shadow-lg">
                            <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                <div className="pt-2 flex items-center gap-2">
                                    <div className="h-8 bg-orange-500 rounded w-16"></div>
                                    <div className="h-8 bg-blue-500 rounded w-24"></div>
                                </div>
                            </div>
                        </div>

                        {/* Theme Selector */}
                        <Select
                            value={isManual ? manualTheme : 'dark'}
                            disabled={!isManual}
                            onValueChange={handleNightThemeChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>Dark</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}

