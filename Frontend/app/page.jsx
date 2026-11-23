'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to AuthApp</h1>
        <p className="text-xl text-gray-600 mb-8">Professional authentication system built with Next.js & React</p>
        
        {isAuthenticated ? (
          <Link href="/dashboard" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
            <Link href="/register" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="p-6 bg-white rounded-lg border">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-xl font-bold mb-2">Secure</h3>
          <p className="text-gray-600">HTTP-only cookies with bcrypt hashing</p>
        </div>
        <div className="p-6 bg-white rounded-lg border">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-xl font-bold mb-2">Fast</h3>
          <p className="text-gray-600">Built with Next.js 16 & React 19</p>
        </div>
        <div className="p-6 bg-white rounded-lg border">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-bold mb-2">Professional</h3>
          <p className="text-gray-600">Clean code & best practices</p>
        </div>
      </div>
    </div>
  );
}
