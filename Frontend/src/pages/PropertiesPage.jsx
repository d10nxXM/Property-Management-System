import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuth from '../hooks/useAuth';
import { getProperties } from '../api/properties';

const PropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProperties({ owner_id: user.id });
        setProperties(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <p className="section-label mb-2">Owner</p>
          <h1 className="text-h2 font-bold text-white light:text-black tracking-tight">
            My Properties
          </h1>
        </div>
        <Link to="/properties/create" className="btn bg-white text-black hover:bg-accent text-xs px-6 py-2.5 self-start sm:self-auto">
          Add Property
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-xs text-muted-light">Loading...</div>
      ) : properties.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-sm text-white light:text-black font-medium mb-2">No properties yet</p>
          <p className="text-xs text-muted-light mb-6">Add your first property to get started.</p>
          <Link to="/properties/create" className="btn bg-white text-black hover:bg-accent text-xs px-6 py-2.5">
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Link to={`/properties/${p.id}`} key={p.id} className="border border-border hover:border-white light:hover:border-black transition-colors group">
              {/* Image */}
              <div className="aspect-video bg-surface-elevated overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-xs text-muted-light uppercase tracking-widest">No image</p>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-5">
                <p className="text-sm font-semibold text-white light:text-black mb-1 truncate">{p.name}</p>
                <p className="text-xs text-muted-light truncate">{p.address || 'No address'}</p>
                {p.city && <p className="text-xs text-muted-light mt-0.5">{p.city}</p>}
                <div className="border-t border-border mt-4 pt-4">
                  <p className="text-xs text-muted-light">View details →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropertiesPage;