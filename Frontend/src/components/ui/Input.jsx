'use client';

import { useState } from 'react';

export function Input({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required,
  id,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id || name}
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
