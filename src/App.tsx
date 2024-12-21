import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import '@/App.css';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { getVersion } from '@tauri-apps/api/app';

// Components
import Layout from '@/Layout';

// Pages
import Home from '@/Pages/Home';
import Edit from '@/Pages/Bot_Edit';

// Contexts
import { NotificationProvider } from '@/Backend/Hooks/NotificationContext';
import { ModalProvider } from '@/Backend/Hooks/Modal/ModalContext';

function App() {
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const currentVersion = await getVersion();
        console.log('Current version:', currentVersion);

        const update = await check();
        console.log('Update check result:', update);

        if (!update) {
          console.log('No update available');
          return;
        }

        console.log(`Update found: ${update.version}`);

        try {
          await update.downloadAndInstall((event) => {
            console.log(
              `Download progress: ${event.data.chunkLength} / ${event.data.contentLength}`
            );
          });

          console.log('Update installed, relaunching...');
          await relaunch();
        } catch (error) {
          console.error('Download/Install error:', error);
        }
      } catch (error) {
        console.error('Update error:', error);
      }
    };

    checkForUpdate();
  }, []);

  return (
    <Router>
      <NotificationProvider>
        <ModalProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/bots/edit/:name" element={<Edit />} />
            </Route>
          </Routes>
        </ModalProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
