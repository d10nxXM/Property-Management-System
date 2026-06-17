import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Alert from '../components/ui/Alert';
import { getProperty, deleteProperty } from '../api/properties';
import { uploadPropertyImage } from '../api/upload';

const statusColor = (status) => {
  if (status === 'open')        return 'badge-blue';
  if (status === 'in_progress') return 'badge-yellow';
  if (status === 'completed')   return 'badge-green';
  if (status === 'cancelled')   return 'badge-red';
  return 'badge-outline';
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getProperty(id)
      .then(res => setProperty(res.data))
      .catch(() => setError('Property not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this property?')) return;
    try {
      await deleteProperty(id);
      navigate('/properties');
    } catch {
      setError('Failed to delete property.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await uploadPropertyImage(id, formData);
      const res = await getProperty(id);
      setProperty(res.data);
    } catch {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <DashboardLayout><p className="text-xs text-muted-light">Loading...</p></DashboardLayout>;
  if (!property) return <DashboardLayout><Alert message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Alert message={error} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div>
          <p className="section-label mb-2">
            <Link to="/properties" className="hover:text-white transition-colors">Properties</Link>
            {' / '}
            {property.name}
          </p>
          <h1 className="text-h2 font-bold text-white light:text-black tracking-tight">
            {property.name}
          </h1>
          {property.city && <p className="text-sm text-muted-light mt-1">{property.city}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/repairs/create?property_id=${property.id}`} className="btn bg-white text-black hover:bg-accent text-xs px-5 py-2.5">
            Post Repair
          </Link>
          <button onClick={handleDelete} className="btn bg-transparent border border-red-500/30 text-red-400 hover:border-red-400 text-xs px-5 py-2.5">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Images */}
          <div className="border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Images</p>
              <label className="btn bg-transparent border border-border text-white hover:border-white text-xs px-4 py-1.5 cursor-pointer">
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {property.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.images.map((img, i) => (
                  <div key={i} className="aspect-video overflow-hidden">
                    <img src={typeof img === 'string' ? img : img.url} alt="" className="w-full h-full object-cover grayscale opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-light">No images uploaded yet.</p>
            )}
          </div>

          {/* Repair Requests */}
          <div className="border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Repair Requests</p>
              <Link to={`/repairs/create?property_id=${property.id}`} className="text-xs text-muted-light hover:text-white transition-colors">
                + Add
              </Link>
            </div>
            {property.repairs?.length > 0 ? (
              <div className="flex flex-col gap-0">
                {property.repairs.map((r) => (
                  <Link to={`/repairs/${r.id}`} key={r.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:opacity-70 transition-opacity">
                    <div>
                      <p className="text-sm text-white light:text-black font-medium truncate max-w-xs">{r.description}</p>
                      <p className="text-xs text-muted-light mt-0.5">{r.category || 'No category'}</p>
                    </div>
                    <span className={statusColor(r.status)}>{r.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-light">No repair requests yet.</p>
            )}
          </div>
        </div>

        {/* Right — Details */}
        <div className="flex flex-col gap-4">
          <div className="border border-border p-6">
            <p className="section-label mb-4">Details</p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-muted-light mb-1">Address</p>
                <p className="text-sm text-white light:text-black">{property.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-light mb-1">City</p>
                <p className="text-sm text-white light:text-black">{property.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-light mb-1">Description</p>
                <p className="text-sm text-white light:text-black leading-relaxed">{property.description || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-light mb-1">Added</p>
                <p className="text-sm text-white light:text-black">{new Date(property.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyDetailPage;