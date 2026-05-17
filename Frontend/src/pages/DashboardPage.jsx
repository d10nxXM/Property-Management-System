import DashboardLayout from '../layouts/DashboardLayout';
import useAuth from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, isOwner, isWorker, isAdmin } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.first_name}! 
        </h1>
        <p className="text-gray-500">
          You are logged in as <span className="font-semibold text-blue-600">{user?.role}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {isOwner && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">My Properties</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">—</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-green-600 font-medium">Active Repairs</p>
                <p className="text-2xl font-bold text-green-800 mt-1">—</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <p className="text-sm text-yellow-600 font-medium">Pending Applications</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">—</p>
              </div>
            </>
          )}

          {isWorker && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">My Applications</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">—</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-green-600 font-medium">Active Jobs</p>
                <p className="text-2xl font-bold text-green-800 mt-1">—</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <p className="text-sm text-yellow-600 font-medium">My Rating</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">—</p>
              </div>
            </>
          )}

          {isAdmin && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">—</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-green-600 font-medium">Total Properties</p>
                <p className="text-2xl font-bold text-green-800 mt-1">—</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <p className="text-sm text-yellow-600 font-medium">Total Repairs</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">—</p>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;