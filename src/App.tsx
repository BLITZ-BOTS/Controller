// Packages
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import '@/App.css';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// Components
import Layout from '@/Layout';

// Pages
import Home from '@/Pages/Home';
import Edit from '@/Pages/Bot_Edit';

// Contexts
import { NotificationProvider } from '@/Backend/Hooks/NotificationContext';
import { ModalProvider } from '@/Backend/Hooks/Modal/ModalContext';

function App() {
  // Check For Update
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const update = await check();
        if (update) {
          console.log(
            `Found update ${update.version} from ${update.date} with notes ${update.body}`
          );
          let downloaded = 0;
          let contentLength = 0;

          // Download and install update
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                contentLength = event.data.contentLength as number;
                console.log(
                  `Started downloading ${event.data.contentLength} bytes`
                );
                break;
              case 'Progress':
                downloaded += event.data.chunkLength;
                console.log(`Downloaded ${downloaded} from ${contentLength}`);
                break;
              case 'Finished':
                console.log('Download finished');
                break;
              default:
                break;
            }
          });

          console.log('Update installed');
          await relaunch();
        }
      } catch (error) {
        console.error('Error during update check or installation:', error);
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
