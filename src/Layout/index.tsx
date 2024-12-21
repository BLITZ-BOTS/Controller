// Packages
import { Outlet } from 'react-router-dom';

// Components
import TitleBar from './TitleBar';
import Navbar from './Navbar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {/* Full Windows Controls */}
      <TitleBar />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="mt-[100px]">{children ? children : <Outlet />}</main>
    </>
  );
};

export default Layout;
