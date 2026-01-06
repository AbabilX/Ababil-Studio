import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { RequestHeader } from '../../types/http';
import { Delete01Icon, Add01Icon } from 'hugeicons-react';

interface HeadersTableProps {
    headers: RequestHeader[];
    onChange: (headers: RequestHeader[]) => void;
}

export function HeadersTable({ headers, onChange }: HeadersTableProps) {
    const [localHeaders, setLocalHeaders] = useState<RequestHeader[]>(
        headers.length > 0
            ? headers
            : [{ key: '', value: '', disabled: false }]
    );

    // Sync local headers with prop changes
    useEffect(() => {
        if (headers.length > 0) {
            setLocalHeaders(headers);
        } else {
            // Only set empty header if current state is also empty
            setLocalHeaders((prev) => {
                if (prev.length === 0 || prev.every(h => !h.key && !h.value)) {
                    return [{ key: '', value: '', disabled: false }];
                }
                return prev;
            });
        }
    }, [headers]);

    const updateHeaders = (newHeaders: RequestHeader[]) => {
        setLocalHeaders(newHeaders);
        onChange(newHeaders);
    };

    const handleHeaderChange = (
        index: number,
        field: 'key' | 'value' | 'disabled',
        value: string | boolean
    ) => {
        const updated = [...localHeaders];
        updated[index] = { ...updated[index], [field]: value };
        updateHeaders(updated);
    };

    const addHeader = () => {
        updateHeaders([...localHeaders, { key: '', value: '', disabled: false }]);
    };

    const removeHeader = (index: number) => {
        const updated = localHeaders.filter((_, i) => i !== index);
        if (updated.length === 0) {
            updated.push({ key: '', value: '', disabled: false });
        }
        updateHeaders(updated);
    };

    return (
        <div className="space-y-2">
            <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-2 text-xs font-medium text-muted-foreground w-[40%]">
                                Key
                            </th>
                            <th className="text-left p-2 text-xs font-medium text-muted-foreground w-[50%]">
                                Value
                            </th>
                            <th className="text-right p-2 text-xs font-medium text-muted-foreground w-[10%]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {localHeaders.map((header, index) => (
                            <tr
                                key={index}
                                className="border-t hover:bg-muted/50 transition-colors"
                            >
                                <td className="p-1">
                                    <Input
                                        value={header.key}
                                        onChange={(e) =>
                                            handleHeaderChange(
                                                index,
                                                'key',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Header name"
                                        className="h-8 text-sm border-0 focus-visible:ring-1"
                                        disabled={header.disabled}
                                    />
                                </td>
                                <td className="p-1">
                                    <Input
                                        value={header.value}
                                        onChange={(e) =>
                                            handleHeaderChange(
                                                index,
                                                'value',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Header value"
                                        className="h-8 text-sm border-0 focus-visible:ring-1"
                                        disabled={header.disabled}
                                    />
                                </td>
                                <td className="p-1">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeHeader(index)}
                                            className="h-7 w-7 p-0"
                                        >
                                            <Delete01Icon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="w-full"
            >
                <Add01Icon className="w-4 h-4 mr-1" />
                Add Header
            </Button>
        </div>
    );
}

