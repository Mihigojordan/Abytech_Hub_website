import { useState, useEffect, useRef } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { usePWA } from "../context/PWAContext";

/**
 * PWASidebarInstall
 *
 * A compact PWA install affordance for the dashboard sidebar.
 *
 * - Android/Desktop: relies entirely on PWAContext's captured
 *   beforeinstallprompt event, which is never preventDefault()-ed — the
 *   browser's own native install UI (address-bar icon / mini-infobar)
 *   already shows automatically. Clicking this button just re-invokes that
 *   same native prompt; it never draws its own install dialog.
 * - iOS: Safari has no beforeinstallprompt at all, so a manual
 *   "Add to Home Screen" tip is the only option there.
 */
const PWASidebarInstall = ({ variant = "sidebar" }) => {
    const { isInstallable, isInstalled, install } = usePWA();
    const [isDismissed, setIsDismissed] = useState(false);
    const [showManualTip, setShowManualTip] = useState(false);
    const tipRef = useRef(null);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    useEffect(() => {
        if (sessionStorage.getItem("pwa-install-dismissed") === "true") {
            setIsDismissed(true);
        }
    }, []);

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
        if (isIOS) {
            setShowManualTip((prev) => !prev);
            return;
        }
        await install();
    };

    const handleDismiss = (e) => {
        e.stopPropagation();
        setIsDismissed(true);
        sessionStorage.setItem("pwa-install-dismissed", "true");
    };

    const showButton = isIOS || isInstallable;

    if (isInstalled || isDismissed || !showButton) return null;

    // ── Sidebar variant (compact icon button) ─────────────────────────────────
    if (variant === "sidebar") {
        return (
            <div className="relative" ref={tipRef}>
                <div className="relative group">
                    <button
                        onClick={handleInstallClick}
                        className="w-10 h-10 flex items-center justify-center text-dashboard-600 bg-dashboard-50 hover:bg-dashboard-100 rounded-lg transition-colors"
                        title="Install App"
                        aria-label="Install app"
                    >
                        <Smartphone className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleDismiss}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                        aria-label="Dismiss install prompt"
                    >
                        <X size={9} />
                    </button>
                </div>

                {showManualTip && isIOS && (
                    <div className="absolute bottom-full left-full ml-3 mb-1 w-60 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="w-4 h-4 text-dashboard-600 flex-shrink-0" />
                            <p className="text-sm font-semibold text-gray-800">Install App</p>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                            <li>
                                <span className="font-medium">iPhone Safari:</span> Share □↑ → "Add to Home Screen"
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

                        {showManualTip && isIOS && (
                            <ul className="mt-3 text-xs text-gray-600 space-y-1 list-disc list-inside border-t pt-3">
                                <li>iPhone: Share □↑ → "Add to Home Screen"</li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWASidebarInstall;
