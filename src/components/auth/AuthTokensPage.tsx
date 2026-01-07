import { useState, useEffect } from 'react';
import { Add01Icon, Delete01Icon, Key01Icon } from 'hugeicons-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AuthToken } from '../../types/auth';
import {
    loadTokens,
    saveToken,
    deleteToken,
} from '../../services/authTokenService';

export function AuthTokensPage() {
    const [tokens, setTokens] = useState<AuthToken[]>([]);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [tokenValue, setTokenValue] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);

    useEffect(() => {
        refreshTokens();
    }, []);

    const refreshTokens = () => {
        setTokens(loadTokens());
    };

    const handleAddToken = () => {
        setTokenName('');
        setTokenValue('');
        setAddDialogOpen(true);
    };

    const handleSaveToken = () => {
        if (!tokenName.trim() || !tokenValue.trim()) return;

        saveToken({
            name: tokenName.trim(),
            value: tokenValue.trim(),
            source: 'manual',
        });
        setAddDialogOpen(false);
        refreshTokens();
    };

    const handleDeleteToken = (id: string) => {
        setTokenToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteToken = () => {
        if (tokenToDelete) {
            deleteToken(tokenToDelete);
            refreshTokens();
            setDeleteDialogOpen(false);
            setTokenToDelete(null);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Auth Tokens</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tokens are stored in memory only and cleared on app
                            restart
                        </p>
                    </div>
                    <Button onClick={handleAddToken}>
                        <Add01Icon className="w-4 h-4 mr-2" />
                        Add Token
                    </Button>
                </div>

                {tokens.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Key01Icon className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No auth tokens yet
                            </p>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                Tokens can be extracted from API responses or
                                added manually. Use{' '}
                                <code className="bg-muted px-1 rounded">{`{{token_name}}`}</code>{' '}
                                in your requests.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {tokens.map((token) => (
                            <Card key={token.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-lg font-mono">
                                                {token.name}
                                            </CardTitle>
                                            <Badge
                                                variant={
                                                    token.source === 'extracted'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {token.source || 'manual'}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteToken(token.id)
                                            }
                                        >
                                            <Delete01Icon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Value
                                            </p>
                                            <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                                                {token.value.length > 80
                                                    ? `${token.value.slice(
                                                          0,
                                                          80
                                                      )}...`
                                                    : token.value}
                                            </code>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Created:{' '}
                                            {formatDate(token.createdAt)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Token Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Auth Token</DialogTitle>
                        <DialogDescription>
                            Add a token manually. Use the token name in requests
                            via{' '}
                            <code className="bg-muted px-1 rounded">{`{{name}}`}</code>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Token Name
                            </label>
                            <Input
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="user_token"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Token Value
                            </label>
                            <Input
                                value={tokenValue}
                                onChange={(e) => setTokenValue(e.target.value)}
                                placeholder="eyJhbGciOiJIUzI1NiIs..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveToken}
                            disabled={!tokenName.trim() || !tokenValue.trim()}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Token</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this token?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setTokenToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteToken}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
