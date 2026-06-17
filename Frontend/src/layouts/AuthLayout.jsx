import Navbar from './Navbar';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-black light:bg-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-sm">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-h2 font-bold text-white light:text-black">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-light mt-2">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;