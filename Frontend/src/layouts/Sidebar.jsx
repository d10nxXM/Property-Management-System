import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { isOwner, isWorker, isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 text-sm transition-colors border-l-2 ${
      isActive
        ? 'border-white text-white light:border-black light:text-black font-medium'
        : 'border-transparent text-muted-light hover:text-white light:hover:text-black hover:border-border'
    }`;

  return (
    <aside className="w-56 min-h-screen border-r border-border pt-8">
      <div className="px-4 mb-6">
        <p className="section-label">Navigation</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/profile"   className={linkClass}>My Profile</NavLink>

        {isOwner && (
          <>
            <div className="px-4 pt-6 pb-2">
              <p className="section-label">Owner</p>
            </div>
            <NavLink to="/properties" className={linkClass}>Properties</NavLink>
            <NavLink to="/repairs"    className={linkClass}>Repair Requests</NavLink>
          </>
        )}

        {isWorker && (
          <>
            <div className="px-4 pt-6 pb-2">
              <p className="section-label">Worker</p>
            </div>
            <NavLink to="/repairs" className={linkClass}>Browse Repairs</NavLink>
            <NavLink to="/workers" className={linkClass}>Workers</NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <div className="px-4 pt-6 pb-2">
              <p className="section-label">Admin</p>
            </div>
            <NavLink to="/admin"   className={linkClass}>Admin Panel</NavLink>
            <NavLink to="/workers" className={linkClass}>Workers</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;