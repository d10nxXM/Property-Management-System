import Navbar from './Navbar';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;