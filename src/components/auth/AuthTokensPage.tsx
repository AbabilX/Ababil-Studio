import { useState, useEffect } from 'react';
import {
    Add01Icon,
    Delete01Icon,
    Edit01Icon,
    Copy01Icon,
} from 'hugeicons-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
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
import { AuthToken, TokenSource } from '../../types/auth';
import {
    loadTokens,
    saveToken,
    updateToken,
    deleteToken,
} from '../../services/authTokenService';

export function AuthTokensPage() {
    const [tokens, setTokens] = useState<AuthToken[]>([]);
    const [selectedToken, setSelectedToken] = useState<AuthToken | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [tokenValue, setTokenValue] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
    const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());

    useEffect(() => {
        refreshTokens();
    }, []);

    const refreshTokens = () => {
        const loadedTokens = loadTokens();
        setTokens(loadedTokens);
    };

    const handleCreateToken = () => {
        setSelectedToken(null);
        setTokenName('');
        setTokenValue('');
        setEditDialogOpen(true);
    };

    const handleEditToken = (token: AuthToken) => {
        setSelectedToken(token);
        setTokenName(token.name);
        setTokenValue(token.value);
        setEditDialogOpen(true);
    };

    const handleSaveToken = () => {
        if (!tokenName.trim() || !tokenValue.trim()) return;

        if (selectedToken) {
            updateToken(selectedToken.id, {
                name: tokenName.trim(),
                value: tokenValue.trim(),
            });
        } else {
            saveToken({
                name: tokenName.trim(),
                value: tokenValue.trim(),
                source: 'manual',
            });
        }
        setEditDialogOpen(false);
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

    const handleCopyToken = (value: string) => {
        navigator.clipboard.writeText(value);
    };

    const toggleRevealToken = (id: string) => {
        const newRevealed = new Set(revealedTokens);
        if (newRevealed.has(id)) {
            newRevealed.delete(id);
        } else {
            newRevealed.add(id);
        }
        setRevealedTokens(newRevealed);
    };

    const maskToken = (value: string, id: string): string => {
        if (revealedTokens.has(id) || value.length <= 8) {
            return value;
        }
        return `••••${value.slice(-4)}`;
    };

    const getSourceBadgeVariant = (source?: TokenSource) => {
        switch (source) {
            case 'extracted':
                return 'default';
            case 'imported':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Auth Tokens</h1>
                    <Button onClick={handleCreateToken}>
                        <Add01Icon className="w-4 h-4 mr-2" />
                        New Token
                    </Button>
                </div>

                {tokens.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground mb-4">
                                No auth tokens yet
                            </p>
                            <Button onClick={handleCreateToken}>
                                Create Token
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tokens ({tokens.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead className="w-[150px]">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tokens.map((token) => (
                                        <TableRow key={token.id}>
                                            <TableCell className="font-mono text-sm">
                                                {token.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">
                                                        {maskToken(token.value, token.id)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleRevealToken(token.id)
                                                        }
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        {revealedTokens.has(token.id) ? 'Hide' : 'Show'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleCopyToken(token.value)
                                                        }
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Copy01Icon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getSourceBadgeVariant(
                                                        token.source
                                                    )}
                                                >
                                                    {token.source || 'manual'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditToken(token)
                                                        }
                                                    >
                                                        <Edit01Icon className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteToken(token.id)
                                                        }
                                                    >
                                                        <Delete01Icon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Token Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedToken ? 'Edit Token' : 'New Token'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedToken
                                ? 'Update your auth token.'
                                : 'Create a new auth token. Use {{token_name}} in your requests to reference it.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Name
                            </label>
                            <Input
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="token_name"
                                disabled={!!selectedToken}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Value
                            </label>
                            <Input
                                type="password"
                                value={tokenValue}
                                onChange={(e) => setTokenValue(e.target.value)}
                                placeholder="token value"
                                autoFocus={!!selectedToken}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
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
                            Are you sure you want to delete this token? This action
                            cannot be undone.
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

