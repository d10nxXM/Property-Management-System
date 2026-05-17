import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { isOwner, isWorker, isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-4 flex flex-col gap-2">
      <p className="text-xs text-gray-400 uppercase font-semibold px-4 mb-2">
        Menu
      </p>

      {/* Svi ulogovani */}
      <NavLink to="/dashboard" className={linkClass}>
        🏠 Dashboard
      </NavLink>

      <NavLink to="/profile" className={linkClass}>
        👤 My Profile
      </NavLink>

      {/* Owner only */}
      {isOwner && (
        <>
          <p className="text-xs text-gray-400 uppercase font-semibold px-4 mt-4 mb-2">
            Owner
          </p>
          <NavLink to="/properties" className={linkClass}>
            🏢 My Properties
          </NavLink>
          <NavLink to="/repairs" className={linkClass}>
            🔧 Repair Requests
          </NavLink>
        </>
      )}

      {/* Worker only */}
      {isWorker && (
        <>
          <p className="text-xs text-gray-400 uppercase font-semibold px-4 mt-4 mb-2">
            Worker
          </p>
          <NavLink to="/repairs" className={linkClass}>
            🔧 Browse Repairs
          </NavLink>
          <NavLink to="/workers" className={linkClass}>
            👷 Workers
          </NavLink>
        </>
      )}

      {/* Admin only */}
      {isAdmin && (
        <>
          <p className="text-xs text-gray-400 uppercase font-semibold px-4 mt-4 mb-2">
            Admin
          </p>
          <NavLink to="/admin" className={linkClass}>
            ⚙️ Admin Panel
          </NavLink>
          <NavLink to="/workers" className={linkClass}>
            👷 Workers
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;