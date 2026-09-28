'use client';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <button onClick={() => logout()} className="px-4 py-2 bg-red-600 text-white rounded">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
