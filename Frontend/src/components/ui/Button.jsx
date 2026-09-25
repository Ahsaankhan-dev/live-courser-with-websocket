'use client';

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  );
}
