'use client';

import React from 'react';

export function HomepageFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-red-400 mb-4">Drinkjoy</h3>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              AI-powered drink recommendations and discovery platform. Find your perfect drink match.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-red-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-400 transition-colors">Contact Us</a></li>
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