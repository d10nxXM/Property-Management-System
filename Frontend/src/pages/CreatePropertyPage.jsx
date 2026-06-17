import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { createProperty } from '../api/properties';
import { getCities } from '../api/lookup';

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [cities, setCities]   = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    getCities().then(res => setCities(res.data)).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const res = await createProperty({
        name:        data.name,
        address:     data.address,
        city_id:     data.city_id || null,
        description: data.description,
      });
      navigate(`/properties/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl">
        <div className="mb-10">
          <p className="section-label mb-2">Properties</p>
          <h1 className="text-h2 font-bold text-white light:text-black tracking-tight">
            Add Property
          </h1>
        </div>

        <Alert message={error} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Property name"
            placeholder="My Apartment"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Address"
            placeholder="123 Main St"
            error={errors.address?.message}
            {...register('address')}
          />

          {/* City select */}
          <div className="mb-4">
            <label className="label">City</label>
            <select className="input" {...register('city_id')}>
              <option value="">Select city</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Describe your property..."
              {...register('description')}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" loading={loading}>
              {loading ? 'Creating...' : 'Create Property'}
            </Button>
            <button
              type="button"
              onClick={() => navigate('/properties')}
              className="btn bg-transparent border border-border text-white hover:border-white text-sm w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePropertyPage;