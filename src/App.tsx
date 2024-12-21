// Packages
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import '@/App.css';

// Components
import Layout from '@/Layout';
import { checkForAppUpdates } from '@/Components/Modals/AppUpdate';

// Pages
import Home from '@/Pages/Home';
import Edit from '@/Pages/Bot_Edit';

// Contexts
import { NotificationProvider } from '@/Backend/Hooks/NotificationContext';
import { ModalProvider } from '@/Backend/Hooks/Modal/ModalContext';

function App() {
  useEffect(() => {
    checkForAppUpdates(false);
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
