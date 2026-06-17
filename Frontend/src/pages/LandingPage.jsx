import { Link } from 'react-router-dom';
import Navbar from '../layouts/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black light:bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-24 border-b border-border">
        <div className="flex items-center gap-16">

          {/* Left — text */}
          <div className="flex-1 min-w-0">
            <p className="section-label mb-8">Property Management Platform</p>
            <h1 style={{ fontSize: '80px', lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '900' }} className="text-white light:text-black mb-8">
              Connect owners with skilled workers
            </h1>
            <p className="text-base text-muted-light max-w-md mb-12 leading-relaxed">
              Post repair requests, find qualified contractors, manage your properties — all in one place.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/register" className="btn bg-white text-black hover:bg-accent text-sm px-8 py-3">
                Get started
              </Link>
              <Link to="/login" className="btn bg-transparent border border-border text-white hover:border-white text-sm px-8 py-3">
                Sign in
              </Link>
            </div>
          </div>

          
          <div className="flex-shrink-0 w-[480px] h-[520px] overflow-hidden">
           
            <img
              src="/propLandPage.png"
              alt="Property management"
              className="w-full h-full object-cover rounded-2xl"
            />
            
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <p className="section-label mb-12">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border">
          <div className="p-8 md:border-r border-border">
            <p className="text-xs text-muted-light mb-8">01</p>
            <h3 className="text-lg font-semibold text-white light:text-black mb-3 tracking-tight">
              Manage Properties
            </h3>
            <p className="text-sm text-muted-light leading-relaxed">
              Add your properties, upload photos and track all repair requests in one dashboard.
            </p>
          </div>
          <div className="p-8 md:border-r border-border">
            <p className="text-xs text-muted-light mb-8">02</p>
            <h3 className="text-lg font-semibold text-white light:text-black mb-3 tracking-tight">
              Post Repair Requests
            </h3>
            <p className="text-sm text-muted-light leading-relaxed">
              Describe the issue, set urgency and receive competitive applications from qualified workers.
            </p>
          </div>
          <div className="p-8">
            <p className="text-xs text-muted-light mb-8">03</p>
            <h3 className="text-lg font-semibold text-white light:text-black mb-3 tracking-tight">
              Find Skilled Workers
            </h3>
            <p className="text-sm text-muted-light leading-relaxed">
              Browse workers by skill, compare prices and ratings, hire the best fit for the job.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="px-8 first:pl-0">
              <p className="text-4xl font-black text-white light:text-black tracking-tighter mb-2">100+</p>
              <p className="text-xs text-muted-light uppercase tracking-widest">Properties managed</p>
            </div>
            <div className="px-8">
              <p className="text-4xl font-black text-white light:text-black tracking-tighter mb-2">500+</p>
              <p className="text-xs text-muted-light uppercase tracking-widest">Skilled workers</p>
            </div>
            <div className="px-8">
              <p className="text-4xl font-black text-white light:text-black tracking-tighter mb-2">98%</p>
              <p className="text-xs text-muted-light uppercase tracking-widest">Satisfaction rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-muted-light">PropManager</p>
          <p className="text-xs text-muted-light">Property management made simple</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;