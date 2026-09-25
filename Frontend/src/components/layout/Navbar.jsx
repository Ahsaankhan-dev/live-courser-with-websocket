'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          AuthApp
        </Link>

        {/* Navigation Links */}
        <div className="flex-1 ml-8 hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className="text-lg">👤</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
