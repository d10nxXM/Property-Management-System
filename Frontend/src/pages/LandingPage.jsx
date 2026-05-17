import { Link } from 'react-router-dom';
import Navbar from '../layouts/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <span className="badge-blue mb-6 inline-block">Property Management Platform</span>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          Connect owners with<br />skilled workers
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Post repair requests, find qualified workers, and manage your properties — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manage Properties
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add your properties, upload photos and track all repair requests in one dashboard.
            </p>
          </div>
          <div className="card p-6">
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Post Repair Requests
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Describe the issue, set urgency and receive applications from qualified workers.
            </p>
          </div>
          <div className="card p-6">
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Find Skilled Workers
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Browse workers by skill, compare prices and ratings, and hire the best fit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;