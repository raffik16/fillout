'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function GlobalFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/logo.png" 
                alt="Drinkjoy Logo" 
                width={120} 
                height={40} 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              AI-powered drink recommendations and discovery platform. Find your perfect drink match.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Drinkjoy. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">🔒 Secure Site</span>
            <span className="text-gray-400 text-sm">✓ GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}