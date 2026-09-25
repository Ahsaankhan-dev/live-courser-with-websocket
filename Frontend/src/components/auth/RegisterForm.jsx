'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*]/,
};

function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) strength++;
  if (PASSWORD_REQUIREMENTS.hasUppercase.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasNumber.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasSpecial.test(password)) strength++;
  return strength;
}

export function RegisterForm() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!PASSWORD_REQUIREMENTS.hasUppercase.test(formData.password)) {
      errors.password = 'Password must contain an uppercase letter';
    } else if (!PASSWORD_REQUIREMENTS.hasNumber.test(formData.password)) {
      errors.password = 'Password must contain a number';
    } else if (!PASSWORD_REQUIREMENTS.hasSpecial.test(formData.password)) {
      errors.password = 'Password must contain a special character (!@#$%^&*)';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await register(formData.name, formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join AuthApp today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            required
          />

          <Input
            type="email"
            name="email"
            label="Email Address"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />

          <div className="mb-4">
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />

            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {strengthLabels[Math.min(passwordStrength, 4)]}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength <= 1
                        ? 'w-1/4 bg-red-500'
                        : passwordStrength === 2
                          ? 'w-2/4 bg-yellow-500'
                          : passwordStrength === 3
                            ? 'w-3/4 bg-blue-500'
                            : 'w-full bg-green-500'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
          />

          <div className="flex items-start mb-4">
            <input
              type="checkbox"
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 mr-3"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {formErrors.termsAccepted && (
            <p className="text-red-600 text-sm -mt-3">{formErrors.termsAccepted}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
