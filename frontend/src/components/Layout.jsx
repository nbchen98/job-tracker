import Navbar from './Navbar.jsx';

/**
 * Layout wrapper component that provides consistent structure for protected pages.
 * Includes persistent navbar and proper spacing for page content.
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
