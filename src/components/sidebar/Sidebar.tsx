import { useState, useMemo } from 'react';
import { Add01Icon, Search01Icon } from 'hugeicons-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CollectionItem } from './CollectionItem';
import { RequestItem } from './RequestItem';
import { Collection, SavedRequest } from '../../types/collection';
import { saveCollection } from '../../services/storage';

interface SidebarProps {
    collections: Collection[];
    requests: SavedRequest[];
    onRequestSelect: (request: SavedRequest) => void;
    activeRequestId?: string;
    onNewCollection?: () => void;
    onNewRequest?: () => void;
    onCollectionCreated?: () => void;
}

export function Sidebar({
    collections,
    requests,
    onRequestSelect,
    activeRequestId,
    onNewCollection,
    onNewRequest,
    onCollectionCreated,
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
        new Set()
    );

    // Filter collections and requests based on search
    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        const query = searchQuery.toLowerCase();
        return collections.filter((c) =>
            c.name.toLowerCase().includes(query)
        );
    }, [collections, searchQuery]);

    const filteredRequests = useMemo(() => {
        if (!searchQuery) {
            return requests.filter((r) => !r.collectionId);
        }
        const query = searchQuery.toLowerCase();
        return requests.filter(
            (r) =>
                !r.collectionId &&
                (r.name.toLowerCase().includes(query) ||
                    r.url.toLowerCase().includes(query))
        );
    }, [requests, searchQuery]);

    const toggleCollection = (collectionId: string) => {
        setExpandedCollections((prev) => {
            const next = new Set(prev);
            if (next.has(collectionId)) {
                next.delete(collectionId);
            } else {
                next.add(collectionId);
            }
            return next;
        });
    };

    const handleNewCollection = () => {
        const name = prompt('Enter collection name:');
        if (name && name.trim()) {
            const newCollection = saveCollection({
                name: name.trim(),
                requests: [],
            });
            setExpandedCollections((prev) => new Set(prev).add(newCollection.id));
            onNewCollection?.();
            onCollectionCreated?.();
        }
    };

    return (
        <div className="h-full flex flex-col bg-card">
            {/* Header */}
            <div className="p-3 border-b border-border space-y-2">
                <div className="flex gap-2">
                    <Button
                        onClick={handleNewCollection}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        <Add01Icon className="w-4 h-4 mr-1" />
                        Collection
                    </Button>
                    <Button
                        onClick={onNewRequest}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        <Add01Icon className="w-4 h-4 mr-1" />
                        Request
                    </Button>
                </div>
                <div className="relative">
                    <Search01Icon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* Collections */}
                {filteredCollections.map((collection) => (
                    <CollectionItem
                        key={collection.id}
                        collection={collection}
                        requests={requests}
                        isExpanded={expandedCollections.has(collection.id)}
                        onToggle={() => toggleCollection(collection.id)}
                        onRequestClick={onRequestSelect}
                        activeRequestId={activeRequestId}
                    />
                ))}

                {/* Requests without collection */}
                {filteredRequests.length > 0 && (
                    <div className="mt-4">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                            Requests
                        </div>
                        {filteredRequests.map((request) => (
                            <RequestItem
                                key={request.id}
                                request={request}
                                onClick={() => onRequestSelect(request)}
                                isActive={request.id === activeRequestId}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {collections.length === 0 && requests.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                            No collections or requests
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Create a collection or request to get started
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

