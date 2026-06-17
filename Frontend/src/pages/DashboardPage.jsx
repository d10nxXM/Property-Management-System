import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuth from '../hooks/useAuth';
import { getProperties } from '../api/properties';
import { getRepairs } from '../api/repairs';
import { getWorkerApplications } from '../api/workers';
import { getStats } from '../api/admin';

const StatCard = ({ label, value, link, linkLabel }) => (
  <div className="border-r border-border last:border-r-0 p-6">
    <p className="section-label mb-4">{label}</p>
    <p className="text-h1 font-bold text-white light:text-black">{value ?? '—'}</p>
    {link && (
      <Link to={link} className="text-xs text-muted-light hover:text-white light:hover:text-black mt-3 inline-block underline underline-offset-4">
        {linkLabel}
      </Link>
    )}
  </div>
);

const DashboardPage = () => {
  const { user, isOwner, isWorker, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isOwner) {
          const [propsRes, repairsRes] = await Promise.all([
            getProperties({ owner_id: user.id }),
            getRepairs({ property_id: undefined }),
          ]);
          const properties = propsRes.data;
          const repairs    = repairsRes.data;

          const activeRepairs  = repairs.filter(r => r.status === 'in_progress').length;
          const openRepairs    = repairs.filter(r => r.status === 'open').length;

          setStats({
            properties:  properties.length,
            active:      activeRepairs,
            open:        openRepairs,
          });
        }

        if (isWorker) {
          const appsRes = await getWorkerApplications(user.id);
          const apps    = appsRes.data;

          const pending  = apps.filter(a => a.status === 'open').length;
          const active   = apps.filter(a => a.status === 'in_progress').length;

          setStats({
            applications: apps.length,
            active,
            pending,
          });
        }

        if (isAdmin) {
          const res  = await getStats();
          const data = res.data;
          setStats({
            users:      data.users.total,
            properties: data.properties,
            repairs:    data.repairs.total,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-12">
        <p className="section-label mb-3">Dashboard</p>
        <h1 className="text-h1 font-bold text-white light:text-black">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-sm text-muted-light mt-2">{user?.role}</p>
      </div>

      {/* Stats */}
      <div className="border border-border grid grid-cols-3 mb-12">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-xs text-muted-light">Loading...</div>
        ) : (
          <>
            {isOwner && (
              <>
                <StatCard label="Properties"         value={stats?.properties}  link="/properties" linkLabel="View properties" />
                <StatCard label="Active Repairs"      value={stats?.active}      link="/repairs"    linkLabel="View repairs" />
                <StatCard label="Open Requests"       value={stats?.open}        link="/repairs"    linkLabel="View all" />
              </>
            )}
            {isWorker && (
              <>
                <StatCard label="Total Applications" value={stats?.applications} link="/repairs"  linkLabel="Browse repairs" />
                <StatCard label="Active Jobs"         value={stats?.active} />
                <StatCard label="Pending"             value={stats?.pending} />
              </>
            )}
            {isAdmin && (
              <>
                <StatCard label="Total Users"       value={stats?.users}      link="/admin" linkLabel="Manage users" />
                <StatCard label="Total Properties"  value={stats?.properties} />
                <StatCard label="Total Repairs"     value={stats?.repairs} />
              </>
            )}
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p className="section-label mb-6">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {isOwner && (
            <>
              <Link to="/properties/create" className="btn bg-white text-black hover:bg-accent text-xs px-6 py-2.5">
                Add Property
              </Link>
              <Link to="/repairs/create" className="btn bg-transparent border border-border text-white hover:border-white text-xs px-6 py-2.5">
                Post Repair Request
              </Link>
              <Link to="/workers" className="btn bg-transparent border border-border text-white hover:border-white text-xs px-6 py-2.5">
                Browse Workers
              </Link>
            </>
          )}
          {isWorker && (
            <>
              <Link to="/repairs" className="btn bg-white text-black hover:bg-accent text-xs px-6 py-2.5">
                Browse Repairs
              </Link>
              <Link to="/profile" className="btn bg-transparent border border-border text-white hover:border-white text-xs px-6 py-2.5">
                Edit Profile
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin" className="btn bg-white text-black hover:bg-accent text-xs px-6 py-2.5">
                Admin Panel
              </Link>
              <Link to="/workers" className="btn bg-transparent border border-border text-white hover:border-white text-xs px-6 py-2.5">
                Manage Workers
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity isOwner={isOwner} isWorker={isWorker} userId={user?.id} />
    </DashboardLayout>
  );
};

const RecentActivity = ({ isOwner, isWorker, userId }) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (isOwner) {
          const res = await getRepairs();
          setItems(res.data.slice(0, 5));
        }
        if (isWorker) {
          const res = await getWorkerApplications(userId);
          setItems(res.data.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (!isOwner && !isWorker) return null;

  const statusColor = (status) => {
    if (status === 'open')        return 'badge-blue';
    if (status === 'in_progress') return 'badge-yellow';
    if (status === 'completed')   return 'badge-green';
    if (status === 'cancelled')   return 'badge-red';
    return 'badge-outline';
  };

  return (
    <div className="mt-12">
      <p className="section-label mb-6">
        {isOwner ? 'Recent Repair Requests' : 'Recent Applications'}
      </p>

      <div className="border border-border">
        {loading ? (
          <div className="p-6 text-xs text-muted-light">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-xs text-muted-light">No activity yet.</div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors">
              <div>
                <p className="text-sm text-white light:text-black font-medium truncate max-w-sm">
                  {item.description || item.repair_description}
                </p>
                <p className="text-xs text-muted-light mt-1">
                  {item.property_name} · {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={statusColor(item.status)}>
                {item.status || 'applied'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage;