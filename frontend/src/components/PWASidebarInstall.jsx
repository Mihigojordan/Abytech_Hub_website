import { useState, useEffect, useRef } from "react";
import { Download, X, Smartphone } from "lucide-react";

/**
 * PWASidebarInstall
 *
 * A compact PWA install button designed for use inside narrow sidebars.
 * Improvements over PWAInstallButton:
 *  - No fixed floating card - lives inline inside the sidebar
 *  - Tooltip on hover instead of verbose card text
 *  - Dismissed state is read once on mount (not on every render)
 *  - Correctly handles browsers that don't fire beforeinstallprompt
 *    (shows a manual-instructions popover instead of a bare alert)
 *  - Cleans up the beforeinstallprompt listener after first capture
 *    to avoid redundant re-registrations
 *  - Accepts a `variant` prop: "sidebar" (default) | "floating"
 */
const PWASidebarInstall = ({ variant = "sidebar" }) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [showManualTip, setShowManualTip] = useState(false);
    const tipRef = useRef(null);

    // Read sessionStorage once on mount
    useEffect(() => {
        if (sessionStorage.getItem("pwa-install-dismissed") === "true") {
            setIsDismissed(true);
        }
    }, []);

    useEffect(() => {
        // Already installed as standalone PWA?
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        const isInWebAppMode = window.navigator.standalone === true;

        if (isStandalone || isInWebAppMode) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowButton(true);
        };

        const handleAppInstalled = () => {
            setShowButton(false);
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        // Fallback: if the browser never fires the event (e.g. Firefox, Safari),
        // show the button after 3 s so the user can still get manual instructions.
        const timer = setTimeout(() => {
            setShowButton((prev) => prev || true);
        }, 3000);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
            clearTimeout(timer);
        };
    }, []);

    // Close manual tip when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (tipRef.current && !tipRef.current.contains(e.target)) {
                setShowManualTip(false);
            }
        };
        if (showManualTip) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [showManualTip]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Browser doesn't support the install prompt – show inline tip
            setShowManualTip((prev) => !prev);
            return;
        }

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setShowButton(false);
            }
        } catch (_) {
            // prompt() can throw if called more than once; ignore
        } finally {
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = (e) => {
        e.stopPropagation();
        setShowButton(false);
        setIsDismissed(true);
        sessionStorage.setItem("pwa-install-dismissed", "true");
    };

    if (isInstalled || isDismissed || !showButton) return null;

    // ── Sidebar variant (compact icon button) ─────────────────────────────────
    if (variant === "sidebar") {
        return (
            <div className="relative" ref={tipRef}>
                {/* Main install button */}
                <div className="relative group">
                    <button
                        onClick={handleInstallClick}
                        className="w-10 h-10 flex items-center justify-center text-dashboard-600 bg-dashboard-50 hover:bg-dashboard-100 rounded-lg transition-colors"
                        title="Install App"
                        aria-label="Install app"
                    >
                        <Smartphone className="w-5 h-5" />
                    </button>

                    {/* Dismiss badge */}
                    <button
                        onClick={handleDismiss}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                        aria-label="Dismiss install prompt"
                    >
                        <X size={9} />
                    </button>
                </div>

                {/* Tooltip / manual instructions popover */}
                {showManualTip && !deferredPrompt && (
                    <div className="absolute bottom-full left-full ml-3 mb-1 w-60 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="w-4 h-4 text-dashboard-600 flex-shrink-0" />
                            <p className="text-sm font-semibold text-gray-800">Install App</p>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                            <li>
                                <span className="font-medium">Android Chrome:</span> Menu ⋮ → "Add to Home screen"
                            </li>
                            <li>
                                <span className="font-medium">iPhone Safari:</span> Share □↑ → "Add to Home Screen"
                            </li>
                            <li>
                                <span className="font-medium">Desktop Chrome/Edge:</span> Address bar install icon
                            </li>
                        </ul>
                        <button
                            onClick={() => setShowManualTip(false)}
                            className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-right"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ── Floating variant (original card style, improved) ──────────────────────
    return (
        <div className="fixed bottom-6 right-6 z-50 animate-float" ref={tipRef}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-xs">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={15} />
                </button>

                <div className="flex items-start gap-3 pr-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-dashboard-50 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-dashboard-600" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Install Abytech Hub</h3>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                            Add to your home screen for faster, offline-ready access.
                        </p>

                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-dashboard-600 hover:bg-dashboard-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-dashboard-500 focus:ring-offset-2"
                        >
                            Install App
                        </button>

                        {showManualTip && (
                            <ul className="mt-3 text-xs text-gray-600 space-y-1 list-disc list-inside border-t pt-3">
                                <li>Android: Menu ⋮ → "Add to Home screen"</li>
                                <li>iPhone: Share □↑ → "Add to Home Screen"</li>
                                <li>Desktop: Address bar install icon</li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWASidebarInstall;
