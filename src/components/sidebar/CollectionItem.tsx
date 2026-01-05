import { Folder01Icon, Folder02Icon, ArrowRight01Icon, ArrowDown01Icon } from 'hugeicons-react';
import { Collection } from '../../types/collection';
import { RequestItem } from './RequestItem';
import { SavedRequest } from '../../types/collection';

interface CollectionItemProps {
    collection: Collection;
    requests: SavedRequest[];
    isExpanded: boolean;
    onToggle: () => void;
    onRequestClick: (request: SavedRequest) => void;
    activeRequestId?: string;
}

export function CollectionItem({
    collection,
    requests,
    isExpanded,
    onToggle,
    onRequestClick,
    activeRequestId,
}: CollectionItemProps) {
    const collectionRequests = requests.filter(
        (r) => r.collectionId === collection.id
    );

    return (
        <div className="select-none">
            <div
                onClick={onToggle}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer rounded-sm group"
            >
                {isExpanded ? (
                    <ArrowDown01Icon className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ArrowRight01Icon className="w-4 h-4 text-muted-foreground" />
                )}
                {isExpanded ? (
                    <Folder02Icon className="w-4 h-4 text-primary" />
                ) : (
                    <Folder01Icon className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="flex-1 text-sm font-medium truncate">
                    {collection.name}
                </span>
                <span className="text-xs text-muted-foreground">
                    {collectionRequests.length}
                </span>
            </div>
            {isExpanded && (
                <div className="ml-6 mt-1 space-y-0.5">
                    {collectionRequests.map((request) => (
                        <RequestItem
                            key={request.id}
                            request={request}
                            onClick={() => onRequestClick(request)}
                            isActive={request.id === activeRequestId}
                        />
                    ))}
                    {collectionRequests.length === 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground italic">
                            No requests
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

