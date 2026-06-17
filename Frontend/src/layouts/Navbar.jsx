import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useThemeStore from '../store/themeStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-border light:border-border-light">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold tracking-tight text-white light:text-black">
          PropManager
        </Link>

        <div className="flex items-center gap-1">
          
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-ghost text-xs px-4 py-2">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-xs px-4 py-2 ml-1">
                Get started
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mr-3">
                <div className="w-7 h-7 bg-accent text-black flex items-center justify-center text-xs font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-white light:text-black leading-none">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-muted-light mt-0.5">{user?.role}</p>
                </div>
              </div>
              <Link to="/dashboard" className="btn-ghost text-xs px-4 py-2">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-danger text-xs px-4 py-2 ml-1">
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;