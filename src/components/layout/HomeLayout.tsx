import { useState, useEffect } from 'react';
import {
    makeSimpleRequest,
    getNativeLibraryStatus,
} from '../../services/httpClient';
import { HttpResponse } from '../../types/http';
import { SavedRequest, Collection, httpRequestToSavedRequest } from '../../types/collection';
import {
    saveRequest,
    loadRequests,
    loadCollections,
} from '../../services/storage';
import { AppHeader } from '../header/AppHeader';
import { RequestSection } from '../request/RequestSection';
import { ResponseSection } from '../response/ResponseSection';
import { Sidebar } from '../sidebar/Sidebar';
import { ResizableLayout } from './ResizableLayout';
import { createSimpleRequest } from '../../types/http';

export function HomeLayout() {
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState(
        'http://localhost:6000/cloths?page=1&limit=20'
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
    const [collections, setCollections] = useState<Collection[]>([]);
    const [requests, setRequests] = useState<SavedRequest[]>([]);
    const [activeRequestId, setActiveRequestId] = useState<string | undefined>();
    const [currentRequestName, setCurrentRequestName] = useState<string>('');

    // Load data on mount
    useEffect(() => {
        refreshData();
    }, []);

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

    const refreshData = () => {
        setCollections(loadCollections());
        setRequests(loadRequests());
    };

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

    const handleRequestSelect = (request: SavedRequest) => {
        setActiveRequestId(request.id);
        setCurrentRequestName(request.name);
        setMethod(request.method);
        setUrl(request.url);
        setRequestBody(request.body || '');
        setResponse(null);
    };

    const handleSave = (name: string, collectionId?: string) => {
        const request = createSimpleRequest(
            method,
            url,
            {},
            requestBody || undefined
        );
        const savedRequestData = httpRequestToSavedRequest(
            request,
            name,
            collectionId
        );
        const saved = saveRequest(savedRequestData);
        setActiveRequestId(saved.id);
        setCurrentRequestName(saved.name);
        refreshData();
    };

    const handleNewRequest = () => {
        setActiveRequestId(undefined);
        setCurrentRequestName('');
        setMethod('GET');
        setUrl('');
        setRequestBody('');
        setResponse(null);
    };

    const sidebar = (
        <Sidebar
            collections={collections}
            requests={requests}
            onRequestSelect={handleRequestSelect}
            activeRequestId={activeRequestId}
            onNewCollection={refreshData}
            onNewRequest={handleNewRequest}
            onCollectionCreated={refreshData}
        />
    );

    const mainContent = (
        <div className="h-full overflow-y-auto bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <AppHeader libraryStatus={libraryStatus} />

                {/* Request Section */}
                <RequestSection
                    method={method}
                    url={url}
                    requestBody={requestBody}
                    loading={loading}
                    currentRequestName={currentRequestName}
                    collections={collections}
                    onMethodChange={setMethod}
                    onUrlChange={setUrl}
                    onBodyChange={setRequestBody}
                    onSend={handleSend}
                    onKeyDown={handleKeyDown}
                    onSave={handleSave}
                />

                {/* Response Section */}
                <ResponseSection
                    response={response}
                    loading={loading}
                    isDarkMode={isDarkMode}
                />

                {/* Footer */}
                <footer className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Powered by Rust • Built with Electron + React
                    </p>
                </footer>
            </div>
        </div>
    );

    return (
        <ResizableLayout sidebar={sidebar} mainContent={mainContent} />
    );
}
