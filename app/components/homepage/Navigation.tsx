'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { UserButton } from '../auth/UserButton';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Drinkjoy Logo" 
                width={96} 
                height={32} 
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => handleScrollToSection('features')}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => handleScrollToSection('how-it-works')}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleScrollToSection('testimonials')}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Reviews
              </button>
              <Link 
                href="/app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Explore App
              </Link>
              <UserButton showDisplayName={true} />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button 
              onClick={() => handleScrollToSection('features')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollToSection('how-it-works')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollToSection('testimonials')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              Reviews
            </button>
            <Link 
              href="/app"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Explore App
            </Link>
            <div className="px-3 py-2">
              <UserButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}