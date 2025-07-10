'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AccessDenied() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        <div className="text-6xl mb-6">🚫</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          {session?.user ? (
            <>
              Sorry, you don&apos;t have permission to access this area. 
              Your current role is <span className="font-semibold">{session.user.role}</span>.
              <br /><br />
              Contact an administrator to request access.
            </>
          ) : (
            'You need to be signed in to access this area.'
          )}
        </p>

        <div className="space-y-3">
          {!session?.user ? (
            <Link
              href="/auth/signin"
              className="block w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Sign In
            </Link>
          ) : null}
          
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}