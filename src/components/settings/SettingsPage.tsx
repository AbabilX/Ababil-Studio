import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { useTheme } from '../../contexts/ThemeContext';

export function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="h-full overflow-y-auto bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground">
                        Customize your Ababil Studio experience
                    </p>
                </div>

                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Choose how Ababil Studio looks to you
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme-select">Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger id="theme-select" className="w-[200px]">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">
                                        System Default
                                    </SelectItem>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                {theme === 'system' && 
                                    'Theme will match your system preference'}
                                {theme === 'light' && 
                                    'Always use light theme'}
                                {theme === 'dark' && 
                                    'Always use dark theme'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* More settings can be added here */}
            </div>
        </div>
    );
}

