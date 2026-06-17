import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import { register as registerApi } from '../api/auth';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        first_name: data.first_name,
        last_name:  data.last_name,
        email:      data.email,
        password:   data.password,
        phone:      data.phone || undefined,
        role:       data.role,
      };

      if (data.role === 'PropertyOwner') {
        payload.preferred_contact_method = data.preferred_contact_method;
      }
      if (data.role === 'Worker') {
        payload.bio              = data.bio || undefined;
        payload.experience_years = data.experience_years ? parseInt(data.experience_years) : undefined;
      }

      const res = await registerApi(payload);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join PropManager today">
      <Alert message={error} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="John"
            error={errors.first_name?.message}
            {...register('first_name', { required: 'Required' })}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            error={errors.last_name?.message}
            {...register('last_name', { required: 'Required' })}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
          })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' }
          })}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+387 61 000 000"
          {...register('phone')}
        />
        <Select
          label="I am a..."
          placeholder="Select your role"
          error={errors.role?.message}
          options={[
            { value: 'PropertyOwner', label: 'Property Owner' },
            { value: 'Worker',        label: 'Worker / Contractor' },
          ]}
          {...register('role', { required: 'Please select a role' })}
        />

        {selectedRole === 'PropertyOwner' && (
          <Select
            label="Preferred contact method"
            placeholder="Select method"
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
            ]}
            {...register('preferred_contact_method')}
          />
        )}

        {selectedRole === 'Worker' && (
          <>
            <Input
              label="Bio (optional)"
              placeholder="Tell owners about your experience..."
              {...register('bio')}
            />
            <Input
              label="Years of experience"
              type="number"
              placeholder="5"
              min="0"
              error={errors.experience_years?.message}
              {...register('experience_years', {
                min: { value: 0, message: 'Cannot be negative' }
              })}
            />
          </>
        )}

        <Button type="submit" loading={loading} className="mt-6">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="text-center text-xs text-muted-light mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-white light:text-black hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;