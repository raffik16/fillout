'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { GlobalFooter } from '../layout/GlobalFooter';

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
  breadcrumb?: string;
}

export function LegalLayout({ title, children, breadcrumb }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">
              <Home className="w-6 h-6" />
              Drinkjoy
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {breadcrumb && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="text-sm">
              <Link href="/" className="text-gray-500 hover:text-red-600">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{breadcrumb}</span>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8 lg:p-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
            {title}
          </h1>
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <GlobalFooter />
    </div>
  );
}