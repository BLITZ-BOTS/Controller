// Packages
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Components
import Layout from './Layout';

// Pages
import Home from './Pages/Home';
import { Test } from './Pages/Tests';

// Contexts
import { NotificationProvider } from './Backend/Hooks/NotificationContext';
import { ModalProvider } from './Backend/Hooks/Modal/ModalContext';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <ModalProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/plugins" element={<Test />} />
            </Route>
          </Routes>
        </ModalProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
