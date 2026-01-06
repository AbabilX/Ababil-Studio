import { useState, useEffect } from 'react';
import { Environment } from '../../types/environment';
import { getVariableValue } from '../../services/environmentService';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface VariableInfoPopupProps {
    variableKey: string;
    environment: Environment | null;
    position: { top: number; left: number };
    onClose: () => void;
    onEdit?: () => void;
    onVariableUpdated?: () => void;
}

export function VariableInfoPopup({
    variableKey,
    environment,
    position,
    onClose,
    onEdit,
    onVariableUpdated,
}: VariableInfoPopupProps) {
    // Get fresh variable value - recalculate on every render to get latest value
    const variableValue = getVariableValue(variableKey, environment);
    const hasValue = variableValue !== null && variableValue.trim() !== '';
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(variableValue || '');

    // Update editValue when variableValue changes (when environment updates)
    useEffect(() => {
        if (!isEditing) {
            setEditValue(variableValue || '');
        }
    }, [variableValue, isEditing, environment?.updatedAt]);

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
            onClose();
        } else {
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        if (!environment) return;
        // Import updateVariable here to avoid circular dependency
        import('../../services/environmentService').then(
            ({ updateVariable }) => {
                const success = updateVariable(
                    environment.id,
                    variableKey,
                    editValue
                );
                if (success) {
                    onVariableUpdated?.();
                    setIsEditing(false);
                }
            }
        );
    };

    return (
        <div
            className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Resolved Value Display */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                    {hasValue ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                        Resolved value
                    </span>
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Enter variable value"
                            className="font-mono text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSave();
                                } else if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setEditValue(variableValue || '');
                                }
                            }}
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                className="h-7 text-xs"
                            >
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditValue(variableValue || '');
                                }}
                                className="h-7 text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="bg-muted rounded-md px-3 py-2 font-mono text-sm break-all">
                            {hasValue ? variableValue : 'Not set'}
                        </div>

                        {/* Environment Info */}
                        {environment ? (
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                            {environment.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {environment.name} Environment
                                    </span>
                                </div>
                                <button
                                    onClick={handleEdit}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-border">
                                <span className="text-xs text-muted-foreground">
                                    No environment selected
                                </span>
                            </div>
                        )}

                        {/* Variables in request link */}
                        <div className="text-xs text-muted-foreground pt-1">
                            Variables in request →
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
