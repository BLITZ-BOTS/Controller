import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '@/App.css';
import { check } from '@tauri-apps/plugin-updater';

// Components
import Layout from '@/Layout';

// Pages
import Home from '@/Pages/Home';
import Edit from '@/Pages/Bot_Edit';
import Plugin_Config from '@/Pages/Plugin_Config';

// Overlays
import { UpdateOverlay } from '@/Components/Updater';

// Contexts
import { ModalProvider } from '@/hooks/Modal/ModalContext';

// Auth
import { handleDeepLink } from '@/Services/Auth/deeplink';

function App() {
  const [showUpdateOverlay, setShowUpdateOverlay] = useState<boolean>(false);

  useEffect(() => {
    // Check if the update overlay has been shown during this session
    const hasCheckedUpdates = sessionStorage.getItem('updateOverlayShown');

    // If the overlay has not been shown during this session
    if (!hasCheckedUpdates) {
      const checkForUpdates = async () => {
        try {
          const update = await check();
          if (!update) {
            setShowUpdateOverlay(false); // Hide overlay if no update is available
          }
        } catch (error) {
          console.error('Update check failed:', error);
          setShowUpdateOverlay(false);
        } finally {
          // Mark the overlay as shown for the session so it won't show again
          sessionStorage.setItem('updateOverlayShown', 'true');
        }
      };

      checkForUpdates();
    }

    handleDeepLink();
  }, []);

  return (
    <Router>
      <ModalProvider>
        {showUpdateOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <UpdateOverlay />
          </div>
        )}
        <div className={showUpdateOverlay ? 'pointer-events-none' : ''}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/bots/edit/:name" element={<Edit />} />
              <Route
                path="/plugins/edit/:bot/:name"
                element={<Plugin_Config />}
              />
            </Route>
          </Routes>
        </div>
      </ModalProvider>
    </Router>
  );
}

export default App;
