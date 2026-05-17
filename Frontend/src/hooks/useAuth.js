import useAuthStore from '../store/authStore';

const useAuth = () => {
  const { user, token, login, logout, updateUser } = useAuthStore();

  const isAuthenticated = !!token;
  const isOwner  = user?.role === 'PropertyOwner';
  const isWorker = user?.role === 'Worker';
  const isAdmin  = user?.role === 'Admin';

  return {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isOwner,
    isWorker,
    isAdmin,
  };
};

export default useAuth;