import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone, FiMonitor } from 'react-icons/fi';
import './InstallPWA.css';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.navigator.standalone;

    if (isIOS && !isInStandaloneMode) {
      setShowIOSInstructions(true);
      setShowInstallButton(true);
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      console.log('PWA: App installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show iOS instructions
      setShowIOSInstructions(true);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showInstallButton) {
    return null;
  }

  // Check if user previously dismissed
  if (localStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  return (
    <>
      {/* Install Button */}
      <div className="pwa-install-banner">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">
            {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
              <FiSmartphone size={24} />
            ) : (
              <FiMonitor size={24} />
            )}
          </div>
          <div className="pwa-install-text">
            <h4>Install Optima RS</h4>
            <p>Get the full app experience on your device</p>
          </div>
          <div className="pwa-install-actions">
            <button onClick={handleInstallClick} className="pwa-install-btn">
              <FiDownload /> Install App
            </button>
            <button onClick={handleDismiss} className="pwa-dismiss-btn" aria-label="Dismiss">
              <FiX />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIOSInstructions && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
        <div className="pwa-ios-modal-overlay" onClick={() => setShowIOSInstructions(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pwa-modal-close" onClick={() => setShowIOSInstructions(false)}>
              <FiX />
            </button>
            <h3>Install Optima RS on iOS</h3>
            <div className="pwa-ios-instructions">
              <div className="pwa-ios-step">
                <div className="pwa-step-number">1</div>
                <p>
                  Tap the <strong>Share</strong> button{' '}
                  <span className="pwa-ios-icon">
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
                      <path d="M8 0L3 5h3v7h4V5h3L8 0zm-8 18h16v2H0v-2z" />
                    </svg>
                  </span>{' '}
                  in Safari's toolbar
                </p>
              </div>
              <div className="pwa-ios-step">
                <div className="pwa-step-number">2</div>
                <p>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>{' '}
                  <span className="pwa-ios-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                      <path d="M16 16H2V2h7V0H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9h-2v7zM11 0v2h3.59l-9.83 9.83 1.41 1.41L16 3.41V7h2V0h-7z" />
                    </svg>
                  </span>
                </p>
              </div>
              <div className="pwa-ios-step">
                <div className="pwa-step-number">3</div>
                <p>
                  Tap <strong>"Add"</strong> to install Optima RS on your home screen
                </p>
              </div>
            </div>
            <button className="pwa-got-it-btn" onClick={() => setShowIOSInstructions(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
