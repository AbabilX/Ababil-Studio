import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Loading01Icon, MailSend01Icon, SaveEnergy01Icon } from 'hugeicons-react';
import { HTTP_METHODS } from '../../utils/constants';
import { getMethodColor } from '../../utils/helpers';
import { Collection } from '../../types/collection';
import { Environment } from '../../types/environment';
import { RequestHeader } from '../../types/http';
import { VariableUrlInput } from './VariableUrlInput';
import { VariableTextarea } from './VariableTextarea';
import { HeadersTable } from './HeadersTable';

interface RequestSectionProps {
    method: string;
    url: string;
    requestBody: string;
    headers: RequestHeader[];
    loading: boolean;
    currentRequestName?: string;
    collections: Collection[];
    activeEnvironment?: Environment | null;
    onMethodChange: (method: string) => void;
    onUrlChange: (url: string) => void;
    onBodyChange: (body: string) => void;
    onHeadersChange: (headers: RequestHeader[]) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onSave?: (name: string, collectionId?: string) => void;
    onEnvironmentUpdate?: () => void;
}

export function RequestSection({
    method,
    url,
    requestBody,
    headers,
    loading,
    currentRequestName,
    collections,
    activeEnvironment,
    onMethodChange,
    onUrlChange,
    onBodyChange,
    onHeadersChange,
    onSend,
    onKeyDown,
    onSave,
    onEnvironmentUpdate,
}: RequestSectionProps) {
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveName, setSaveName] = useState(currentRequestName || '');
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

    const handleSave = () => {
        if (saveName.trim() && onSave) {
            onSave(saveName.trim(), selectedCollectionId || undefined);
            setSaveDialogOpen(false);
            setSaveName('');
            setSelectedCollectionId('');
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {currentRequestName || 'Request'}
                        </CardTitle>
                        {onSave && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSaveName(currentRequestName || '');
                                    setSaveDialogOpen(true);
                                }}
                            >
                                <SaveEnergy01Icon className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                        )}
                    </div>
                </CardHeader>
            <CardContent className="space-y-4">
                {/* URL Bar */}
                <div className="flex gap-2">
                    <Select value={method} onValueChange={onMethodChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue>
                                <span
                                    className={`font-semibold ${getMethodColor(
                                        method
                                    )}`}
                                >
                                    {method}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {HTTP_METHODS.map((m) => (
                                <SelectItem key={m} value={m}>
                                    <span
                                        className={`font-semibold ${getMethodColor(
                                            m
                                        )}`}
                                    >
                                        {m}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <VariableUrlInput
                        value={url}
                        onChange={onUrlChange}
                        onKeyDown={onKeyDown}
                        placeholder="Enter request URL..."
                        activeEnvironment={activeEnvironment || null}
                        onEnvironmentUpdate={onEnvironmentUpdate}
                    />

                    <Button onClick={onSend} disabled={loading || !url.trim()}>
                        {loading ? (
                            <Loading01Icon className="w-4 h-4 animate-spin" />
                        ) : (
                            <MailSend01Icon className="w-4 h-4" />
                        )}
                        Send
                    </Button>
                </div>

                {/* Headers and Body Tabs */}
                <Tabs defaultValue="headers" className="w-full">
                    <TabsList className={['POST', 'PUT', 'PATCH'].includes(method) ? 'grid w-full grid-cols-2' : 'grid w-full grid-cols-1'}>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                        {['POST', 'PUT', 'PATCH'].includes(method) && (
                            <TabsTrigger value="body">Body</TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value="headers" className="mt-4">
                        <HeadersTable headers={headers} onChange={onHeadersChange} />
                    </TabsContent>
                    {['POST', 'PUT', 'PATCH'].includes(method) && (
                        <TabsContent value="body" className="mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Request Body (JSON)
                                </label>
                                <VariableTextarea
                                    value={requestBody}
                                    onChange={onBodyChange}
                                    placeholder='{"key": "value"}'
                                    rows={8}
                                    activeEnvironment={activeEnvironment || null}
                                    onEnvironmentUpdate={onEnvironmentUpdate}
                                />
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </CardContent>
        </Card>

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Request</DialogTitle>
                    <DialogDescription>
                        Save this request to your collection for easy access
                        later.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Request Name
                        </label>
                        <Input
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="My API Request"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Collection (Optional)
                        </label>
                        <Select
                            value={selectedCollectionId}
                            onValueChange={setSelectedCollectionId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="No collection" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">No collection</SelectItem>
                                {collections.map((collection) => (
                                    <SelectItem
                                        key={collection.id}
                                        value={collection.id}
                                    >
                                        {collection.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setSaveDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!saveName.trim()}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
