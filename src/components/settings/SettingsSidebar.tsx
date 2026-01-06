import {
    Settings01Icon,
    ColorsIcon,
    KeyboardIcon,
    SparklesIcon,
    Database01Icon,
    PuzzleIcon,
    File01Icon,
    CloudServerIcon,
    Download01Icon,
    InformationCircleIcon,
} from 'hugeicons-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export type SettingsSection =
    | 'general'
    | 'themes'
    | 'shortcuts'
    | 'ai'
    | 'data'
    | 'addons'
    | 'certificates'
    | 'proxy'
    | 'update'
    | 'about';

interface SettingsSidebarProps {
    activeSection: SettingsSection;
    onSectionChange: (section: SettingsSection) => void;
}

const settingsSections: Array<{
    id: SettingsSection;
    label: string;
    icon: React.ReactNode;
}> = [
    {
        id: 'general',
        label: 'General',
        icon: <Settings01Icon className="w-5 h-5" />,
    },
    {
        id: 'themes',
        label: 'Themes',
        icon: <ColorsIcon className="w-5 h-5" />,
    },
    {
        id: 'shortcuts',
        label: 'Shortcuts',
        icon: <KeyboardIcon className="w-5 h-5" />,
    },
    {
        id: 'ai',
        label: 'AI',
        icon: <SparklesIcon className="w-5 h-5" />,
    },
    {
        id: 'data',
        label: 'Data',
        icon: <Database01Icon className="w-5 h-5" />,
    },
    {
        id: 'addons',
        label: 'Add-ons',
        icon: <PuzzleIcon className="w-5 h-5" />,
    },
    {
        id: 'certificates',
        label: 'Certificates',
        icon: <File01Icon className="w-5 h-5" />,
    },
    {
        id: 'proxy',
        label: 'Proxy',
        icon: <CloudServerIcon className="w-5 h-5" />,
    },
    {
        id: 'update',
        label: 'Update',
        icon: <Download01Icon className="w-5 h-5" />,
    },
    {
        id: 'about',
        label: 'About',
        icon: <InformationCircleIcon className="w-5 h-5" />,
    },
];

export function SettingsSidebar({
    activeSection,
    onSectionChange,
}: SettingsSidebarProps) {
    return (
        <div className="w-64 border-r border-border bg-card h-full flex flex-col flex-shrink-0">
            <div className="p-4 space-y-1">
                {settingsSections.map((section) => (
                    <Button
                        key={section.id}
                        variant="ghost"
                        className={cn(
                            'w-full justify-start gap-3 h-auto py-2.5 px-3',
                            activeSection === section.id &&
                                'bg-secondary text-secondary-foreground'
                        )}
                        onClick={() => onSectionChange(section.id)}
                    >
                        {section.icon}
                        <span className="text-sm font-medium">
                            {section.label}
                        </span>
                    </Button>
                ))}
            </div>
        </div>
    );
}

