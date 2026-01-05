import React, { useState, useEffect } from 'react';
import {
    makeSimpleRequest,
    getNativeLibraryStatus,
    getStatusText,
} from './services/httpClient';
import { HttpResponse } from './types/http';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './components/ui/select';
import { Loader2, Send, Zap } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
    vscDarkPlus,
    oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

// HTTP Methods
const HTTP_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
];

function App() {
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState(
        'https://jsonplaceholder.typicode.com/posts/1'
    );
    const [requestBody, setRequestBody] = useState('');
    const [response, setResponse] = useState<HttpResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [libraryStatus, setLibraryStatus] = useState<{
        initialized: boolean;
        error?: string;
        libraryPath?: string;
    } | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Check native library status on mount
    useEffect(() => {
        checkLibraryStatus();
    }, []);

    // Detect dark mode
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) =>
            setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const checkLibraryStatus = async () => {
        const status = await getNativeLibraryStatus();
        setLibraryStatus(status);
    };

    const handleSend = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setResponse(null);

        try {
            const headers: Record<string, string> = {};
            if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
                headers['Content-Type'] = 'application/json';
            }

            const result = await makeSimpleRequest(
                method,
                url,
                headers,
                requestBody || undefined
            );
            setResponse(result);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            setResponse({
                status_code: 0,
                headers: [],
                body: `Error: ${errorMessage}`,
                duration_ms: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSend();
        }
    };

    const detectLanguage = (body: string): string => {
        const trimmed = body.trim();

        // Try to parse as JSON
        try {
            JSON.parse(trimmed);
            return 'json';
        } catch {
            // Not JSON
        }

        // Check for XML
        if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
            return 'xml';
        }

        // Check for HTML
        if (
            trimmed.match(/^<html[\s>]/i) ||
            trimmed.match(/^<!DOCTYPE html/i)
        ) {
            return 'html';
        }

        // Check for CSS
        if (
            trimmed.includes('{') &&
            trimmed.includes('}') &&
            trimmed.includes(':')
        ) {
            const cssPattern = /[a-zA-Z-]+\s*:\s*[^;]+;/;
            if (cssPattern.test(trimmed)) {
                return 'css';
            }
        }

        // Check for JavaScript
        if (
            trimmed.includes('function') ||
            trimmed.includes('=>') ||
            trimmed.includes('const ') ||
            trimmed.includes('let ')
        ) {
            return 'javascript';
        }

        // Default to plain text
        return 'text';
    };

    const formatBody = (body: string): string => {
        try {
            const parsed = JSON.parse(body);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return body;
        }
    };

    const getStatusVariant = (
        code: number
    ): 'default' | 'success' | 'warning' | 'destructive' => {
        if (code === 0) return 'destructive';
        if (code >= 200 && code < 300) return 'success';
        if (code >= 300 && code < 400) return 'warning';
        if (code >= 400) return 'destructive';
        return 'default';
    };

    const getMethodColor = (m: string): string => {
        const colors: Record<string, string> = {
            GET: 'text-green-600 dark:text-green-400',
            POST: 'text-yellow-600 dark:text-yellow-400',
            PUT: 'text-blue-600 dark:text-blue-400',
            PATCH: 'text-purple-600 dark:text-purple-400',
            DELETE: 'text-red-600 dark:text-red-400',
            HEAD: 'text-cyan-600 dark:text-cyan-400',
            OPTIONS: 'text-gray-600 dark:text-gray-400',
        };
        return colors[m] || '';
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        আবাবিল স্টুডিও
                    </h1>
                    <p className="text-muted-foreground">
                        Rust-powered API Testing Platform
                    </p>

                    {/* Library Status */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                libraryStatus?.initialized
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }`}
                        />
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            {libraryStatus?.initialized ? (
                                <>
                                    <Zap className="w-3 h-3" />
                                    Rust Core Connected
                                </>
                            ) : (
                                libraryStatus?.error || 'Connecting...'
                            )}
                        </span>
                    </div>
                </div>

                {/* Request Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* URL Bar */}
                        <div className="flex gap-2">
                            <Select value={method} onValueChange={setMethod}>
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

                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter request URL..."
                                className="flex-1 font-mono text-sm"
                            />

                            <Button
                                onClick={handleSend}
                                disabled={loading || !url.trim()}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Send
                            </Button>
                        </div>

                        {/* Request Body */}
                        {['POST', 'PUT', 'PATCH'].includes(method) && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Request Body (JSON)
                                </label>
                                <Textarea
                                    value={requestBody}
                                    onChange={(e) =>
                                        setRequestBody(e.target.value)
                                    }
                                    placeholder='{"key": "value"}'
                                    rows={4}
                                    className="font-mono text-sm resize-none"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Response Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Response</CardTitle>
                            {response && (
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={getStatusVariant(
                                            response.status_code
                                        )}
                                    >
                                        {response.status_code}{' '}
                                        {getStatusText(response.status_code)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {response.duration_ms}ms
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Executing request...
                                    </span>
                                </div>
                            </div>
                        ) : response ? (
                            <Tabs defaultValue="body" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="body">Body</TabsTrigger>
                                    <TabsTrigger value="headers">
                                        Headers ({response.headers.length})
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="body">
                                    <div className="mt-4 rounded-lg max-h-[400px] overflow-auto border border-border">
                                        <SyntaxHighlighter
                                            language={detectLanguage(
                                                response.body
                                            )}
                                            style={
                                                isDarkMode
                                                    ? vscDarkPlus
                                                    : oneLight
                                            }
                                            customStyle={{
                                                margin: 0,
                                                padding: '1rem',
                                                borderRadius: '0.5rem',
                                                background: '#000000',
                                                fontSize: '0.875rem',
                                            }}
                                            codeTagProps={{
                                                style: {
                                                    fontFamily:
                                                        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                                                },
                                            }}
                                        >
                                            {formatBody(response.body)}
                                        </SyntaxHighlighter>
                                    </div>
                                </TabsContent>
                                <TabsContent value="headers">
                                    <div className="mt-4 p-4 bg-muted rounded-lg max-h-[400px] overflow-auto space-y-2">
                                        {response.headers.length > 0 ? (
                                            response.headers.map(
                                                ([key, value], i) => (
                                                    <div
                                                        key={i}
                                                        className="flex gap-2 text-sm font-mono"
                                                    >
                                                        <span className="font-semibold text-primary">
                                                            {key}:
                                                        </span>
                                                        <span className="text-muted-foreground break-all">
                                                            {value}
                                                        </span>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No headers
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="flex items-center justify-center h-[300px]">
                                <div className="text-center space-y-2">
                                    <div className="text-4xl">🚀</div>
                                    <p className="text-muted-foreground">
                                        Enter a URL and click Send to make a
                                        request
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Press{' '}
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                            ⌘
                                        </kbd>{' '}
                                        +{' '}
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                            Enter
                                        </kbd>{' '}
                                        to send
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <footer className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Powered by Rust • Built with Electron + React
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default App;
