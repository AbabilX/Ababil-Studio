import { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';
import '../../styles/sidebar/resizable-layout.css';

interface ResizableLayoutProps {
    sidebar: ReactNode | null;
    mainContent: ReactNode;
    defaultSidebarWidth?: number;
    minSidebarWidth?: number;
    maxSidebarWidth?: number;
}

export function ResizableLayout({
    sidebar,
    mainContent,
    defaultSidebarWidth = 250,
    minSidebarWidth = 200,
    maxSidebarWidth = 400,
}: ResizableLayoutProps) {
    const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);
    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs for drag tracking (no React state updates during drag)
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);
    const rafIdRef = useRef<number | null>(null);

    // Load saved width from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('ababil_sidebar_width');
        if (saved) {
            const width = parseInt(saved, 10);
            if (width >= minSidebarWidth && width <= maxSidebarWidth) {
                setSidebarWidth(width);
            }
        }
    }, [minSidebarWidth, maxSidebarWidth]);

    // Save width to localStorage (only on mouseup, not during drag)
    const saveWidthToStorage = useCallback(
        (width: number) => {
            if (!isCollapsed) {
                localStorage.setItem('ababil_sidebar_width', width.toString());
            }
        },
        [isCollapsed]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!sidebarRef.current || !toggleButtonRef.current) return;

            // Store initial values
            startXRef.current = e.clientX;
            startWidthRef.current = sidebarWidth;

            // Add resizing class to disable transitions
            if (containerRef.current) {
                containerRef.current.classList.add('resizing');
            }

            // Prevent text selection during drag
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';

            setIsResizing(true);
        },
        [sidebarWidth]
    );

    useEffect(() => {
        if (!isResizing) {
            // Clean up resizing state
            if (containerRef.current) {
                containerRef.current.classList.remove('resizing');
            }
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            // Cancel any pending animation frame
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            // Cancel previous animation frame if pending
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }

            // Use requestAnimationFrame for smooth 60fps updates
            rafIdRef.current = requestAnimationFrame(() => {
                if (!sidebarRef.current || !toggleButtonRef.current) return;

                const deltaX = e.clientX - startXRef.current;
                const newWidth = Math.max(
                    minSidebarWidth,
                    Math.min(maxSidebarWidth, startWidthRef.current + deltaX)
                );

                // Direct DOM manipulation - no React state update
                sidebarRef.current.style.width = `${newWidth}px`;
                toggleButtonRef.current.style.left = `${newWidth}px`;
            });
        };

        const handleMouseUp = () => {
            if (!sidebarRef.current || !toggleButtonRef.current) return;

            // Get final width from DOM
            const finalWidth = sidebarRef.current.offsetWidth;

            // Sync to React state (only once on mouseup)
            setSidebarWidth(finalWidth);

            // Save to localStorage
            saveWidthToStorage(finalWidth);

            // Clean up
            setIsResizing(false);

            if (containerRef.current) {
                containerRef.current.classList.remove('resizing');
            }
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };

        document.addEventListener('mousemove', handleMouseMove, {
            passive: true,
        });
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Cleanup on unmount
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isResizing, minSidebarWidth, maxSidebarWidth, saveWidthToStorage]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (!sidebar) {
        // No sidebar, just show main content
        return (
            <div className="h-full w-full overflow-hidden bg-background">
                {mainContent}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex h-full overflow-hidden relative"
        >
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`bg-card border-r border-border relative ${
                    isCollapsed ? 'w-0 overflow-hidden' : ''
                } ${isResizing ? '' : 'transition-all duration-300'}`}
                style={{
                    width: isCollapsed ? 0 : `${sidebarWidth}px`,
                    minWidth: isCollapsed ? 0 : `${minSidebarWidth}px`,
                    willChange: isResizing ? 'width' : 'auto',
                }}
            >
                {!isCollapsed && (
                    <div className="h-full overflow-y-auto">{sidebar}</div>
                )}
            </div>

            {/* Toggle Button - Always visible */}
            <button
                ref={toggleButtonRef}
                onClick={toggleCollapse}
                className={`absolute top-1/2 -translate-y-1/2 z-20 bg-card border border-border rounded-r-lg p-1.5 hover:bg-accent shadow-sm ${
                    isResizing ? '' : 'transition-all duration-300'
                }`}
                style={{
                    left: isCollapsed ? 0 : `${sidebarWidth}px`,
                    willChange: isResizing ? 'left' : 'auto',
                }}
            >
                {isCollapsed ? (
                    <ArrowRight01Icon className="w-4 h-4" />
                ) : (
                    <ArrowLeft01Icon className="w-4 h-4" />
                )}
            </button>

            {/* Resize Handle */}
            {!isCollapsed && (
                <div
                    ref={resizeRef}
                    onMouseDown={handleMouseDown}
                    className={`w-1 bg-border hover:bg-primary/50 cursor-col-resize z-30 ${
                        isResizing ? 'bg-primary' : 'transition-colors'
                    }`}
                    style={{
                        willChange: isResizing ? 'background-color' : 'auto',
                    }}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-background">
                {mainContent}
            </div>
        </div>
    );
}
