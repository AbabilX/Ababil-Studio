import { useState, useEffect } from 'react';
import { makeSimpleRequest } from '../../services/httpClient';
import { HttpResponse } from '../../types/http';
import {
    SavedRequest,
    Collection,
    httpRequestToSavedRequest,
} from '../../types/collection';
import { RequestHeader } from '../../types/http';
import { Environment } from '../../types/environment';
import {
    saveRequest,
    loadRequests,
    loadCollections,
} from '../../services/storage';
import {
    loadEnvironments,
    getActiveEnvironment,
    setActiveEnvironment,
} from '../../services/environmentService';
import {
    replaceVariablesInUrl,
    replaceVariablesInBody,
    replaceVariablesInHeaders,
} from '../../utils/variableReplacer';
import { useTheme } from '../../contexts/ThemeContext';
import { TopHeader } from '../header/TopHeader';
import { LeftNav } from '../navigation/LeftNav';
import { RequestSection } from '../request/RequestSection';
import { ResponseSection } from '../response/ResponseSection';
import { Sidebar } from '../sidebar/Sidebar';
import { EnvironmentPage } from '../environment/EnvironmentPage';
import { SettingsPage } from '../settings/SettingsPage';
import { ResizableLayout } from './ResizableLayout';
import { createSimpleRequest } from '../../types/http';

type ViewType = 'collections' | 'environments' | 'settings';

export function HomeLayout() {
    const { effectiveTheme } = useTheme();
    const [currentView, setCurrentView] = useState<ViewType>('collections');
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState(
        'http://localhost:6000/cloths?page=1&limit=20'
    );
    const [requestBody, setRequestBody] = useState('');
    const [headers, setHeaders] = useState<RequestHeader[]>([]);
    const [response, setResponse] = useState<HttpResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [requests, setRequests] = useState<SavedRequest[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [activeEnvironment, setActiveEnvironmentState] =
        useState<Environment | null>(null);
    const [activeRequestId, setActiveRequestId] = useState<
        string | undefined
    >();
    const [currentRequestName, setCurrentRequestName] = useState<string>('');

    // Load data on mount
    useEffect(() => {
        refreshData();
        refreshEnvironments();
    }, []);

    const refreshData = () => {
        setCollections(loadCollections());
        setRequests(loadRequests());
    };

    const refreshEnvironments = () => {
        const envs = loadEnvironments();
        setEnvironments(envs);
        // Get fresh environment to ensure React detects the change
        const activeEnv = getActiveEnvironment();
        // Force update by creating a new object reference
        if (activeEnv) {
            setActiveEnvironmentState({ ...activeEnv });
        } else {
            setActiveEnvironmentState(null);
        }
    };

    const handleEnvironmentChange = (environmentId: string) => {
        if (environmentId) {
            setActiveEnvironment(environmentId);
            refreshEnvironments();
        } else {
            // Clear active environment
            localStorage.removeItem('ababil_active_environment');
            refreshEnvironments();
        }
    };

    const handleSend = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setResponse(null);

        try {
            // Replace variables before sending
            const resolvedUrl = replaceVariablesInUrl(url, activeEnvironment);
            const resolvedBody = replaceVariablesInBody(
                requestBody,
                activeEnvironment
            );
            // Convert headers array to Record, filtering out disabled and empty headers
            const headersRecord: Record<string, string> = {};
            headers
                .filter((h) => !h.disabled && h.key.trim())
                .forEach((h) => {
                    headersRecord[h.key] = h.value;
                });

            // Add Content-Type header for POST/PUT/PATCH if body exists
            if (resolvedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
                if (!headersRecord['Content-Type']) {
                    headersRecord['Content-Type'] = 'application/json';
                }
            }

            const resolvedHeaders = replaceVariablesInHeaders(
                headersRecord,
                activeEnvironment
            );

            const result = await makeSimpleRequest(
                method,
                resolvedUrl,
                resolvedHeaders,
                resolvedBody || undefined
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
        // Convert headers from Record to RequestHeader array
        if (request.headers) {
            setHeaders(
                Object.entries(request.headers).map(([key, value]) => ({
                    key,
                    value,
                    disabled: false,
                }))
            );
        } else {
            setHeaders([]);
        }
        setResponse(null);
    };

    const handleSave = (name: string, collectionId?: string) => {
        // Convert headers array to Record for saving
        const headersRecord: Record<string, string> = {};
        headers
            .filter((h) => !h.disabled && h.key.trim())
            .forEach((h) => {
                headersRecord[h.key] = h.value;
            });

        const request = createSimpleRequest(
            method,
            url,
            headersRecord,
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
        setHeaders([]);
        setResponse(null);
    };

    const handleNavClick = (view: ViewType) => {
        setCurrentView(view);
    };

    // Sidebar content (collections/requests)
    const sidebar = (
        <Sidebar
            collections={collections}
            requests={requests}
            onRequestSelect={handleRequestSelect}
            activeRequestId={activeRequestId}
            onNewCollection={refreshData}
            onNewRequest={handleNewRequest}
            onCollectionCreated={refreshData}
            onImportComplete={() => {
                refreshData();
                refreshEnvironments();
            }}
        />
    );

    // Main content based on current view
    const renderMainContent = () => {
        if (currentView === 'environments') {
            return <EnvironmentPage />;
        }

        if (currentView === 'settings') {
            return <SettingsPage />;
        }

        // Collections view (default)
        return (
            <div className="h-full overflow-y-auto bg-background p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Request Section */}
                    <RequestSection
                        method={method}
                        url={url}
                        requestBody={requestBody}
                        headers={headers}
                        loading={loading}
                        currentRequestName={currentRequestName}
                        collections={collections}
                        activeEnvironment={activeEnvironment}
                        onMethodChange={setMethod}
                        onUrlChange={setUrl}
                        onBodyChange={setRequestBody}
                        onHeadersChange={setHeaders}
                        onSend={handleSend}
                        onKeyDown={handleKeyDown}
                        onSave={handleSave}
                        onEnvironmentUpdate={refreshEnvironments}
                    />

                    {/* Response Section */}
                    <ResponseSection
                        response={response}
                        loading={loading}
                        isDarkMode={effectiveTheme === 'dark'}
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
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
            {/* Top Header */}
            <TopHeader
                activeEnvironment={activeEnvironment}
                environments={environments}
                onEnvironmentChange={handleEnvironmentChange}
                onSettingsClick={() => handleNavClick('settings')}
            />

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Navigation */}
                <LeftNav
                    activeItem={currentView}
                    onItemClick={handleNavClick}
                />

                {/* Resizable Layout with Sidebar and Main Content */}
                <div className="flex-1 overflow-hidden">
                    <ResizableLayout
                        sidebar={currentView === 'collections' ? sidebar : null}
                        mainContent={renderMainContent()}
                    />
                </div>
            </div>
        </div>
    );
}
