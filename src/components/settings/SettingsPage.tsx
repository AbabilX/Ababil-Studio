import { useState } from 'react';
import { SettingsSidebar, SettingsSection } from './SettingsSidebar';
import { ThemesSection } from './ThemesSection';

export function SettingsPage() {
    const [activeSection, setActiveSection] =
        useState<SettingsSection>('themes');

    const renderContent = () => {
        switch (activeSection) {
            case 'themes':
                return <ThemesSection />;
            case 'general':
            case 'shortcuts':
            case 'ai':
            case 'data':
            case 'addons':
            case 'certificates':
            case 'proxy':
            case 'update':
            case 'about':
                return (
                    <div className="h-full overflow-y-auto bg-background p-8">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl font-bold mb-4 capitalize">
                                {activeSection}
                            </h1>
                            <p className="text-muted-foreground">
                                {activeSection.charAt(0).toUpperCase() +
                                    activeSection.slice(1)}{' '}
                                settings coming soon.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex overflow-hidden">
            <SettingsSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            <div className="flex-1 overflow-hidden">{renderContent()}</div>
        </div>
    );
}
