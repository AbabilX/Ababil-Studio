import { File01Icon } from 'hugeicons-react';
import { SavedRequest } from '../../types/collection';
import { Badge } from '../ui/badge';
import { getMethodColor } from '../../utils/helpers';

interface RequestItemProps {
    request: SavedRequest;
    onClick: () => void;
    isActive?: boolean;
}

export function RequestItem({ request, onClick, isActive }: RequestItemProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors ${
                isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-foreground'
            }`}
        >
            <File01Icon
                className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
            />
            <Badge
                variant="outline"
                className={`text-xs px-1.5 py-0 h-5 ${getMethodColor(
                    request.method
                )} border-current`}
            >
                {request.method}
            </Badge>
            <span className="flex-1 text-sm truncate">{request.name}</span>
        </div>
    );
}

