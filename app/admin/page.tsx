'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Bar {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
  active: boolean;
  _count?: {
    drinks: number;
    users: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bars, setBars] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
  });

  useEffect(() => {
    fetchBars();
  }, []);

  const fetchBars = async () => {
    try {
      const response = await fetch('/api/bars');
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setBars(data);
      } else if (response.ok && !Array.isArray(data)) {
        console.error('Invalid response format:', data);
        setBars([]);
      } else {
        console.error('API error:', data);
        setBars([]);
      }
    } catch (error) {
      console.error('Error fetching bars:', error);
      setBars([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/bars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchBars();
        setShowCreateForm(false);
        setFormData({
          name: '',
          slug: '',
          description: '',
          location: '',
          email: '',
          phone: '',
          website: '',
          logo: '',
        });
      }
    } catch (error) {
      console.error('Error creating bar:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleDeleteBar = async (barId: string, barName: string) => {
    if (!confirm(`Are you sure you want to delete "${barName}"? This will also delete all drinks associated with this bar.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bars/${barId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBars();
      } else {
        const error = await response.json();
        alert(`Failed to delete bar: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting bar:', error);
      alert('Failed to delete bar');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Show loading while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated (middleware should handle this, but just in case)
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Bar Management</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add New Bar
                </button>
              </div>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Welcome, {session?.user?.name || session?.user?.email}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {session?.user?.role}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="p-6">
            {bars.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No bars created yet. Click "Add New Bar" to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {bars.map((bar) => (
                  <div key={bar.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        {bar.logo && (
                          <img
                            src={bar.logo}
                            alt={bar.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{bar.name}</h3>
                          <p className="text-sm text-gray-500">/{bar.slug}</p>
                          {bar.description && (
                            <p className="text-gray-600 mt-2">{bar.description}</p>
                          )}
                          {bar.location && (
                            <p className="text-sm text-gray-500 mt-1">📍 {bar.location}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>{bar._count?.drinks || 0} drinks</span>
                            <span>{bar._count?.users || 0} users</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/${bar.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                          title="View bar"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                        <a
                          href={`/admin/bars/${bar.id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Manage drinks"
                        >
                          <Edit2 className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => handleDeleteBar(bar.id, bar.name)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete bar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Bar Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Create New Bar</h2>
              <form onSubmit={handleCreateBar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bar Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="bar-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL will be: drinkjoy.app/{formData.slug || 'bar-name'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="New York, NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bar Logo
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {formData.logo && (
                      <div className="relative w-32 h-32">
                        <img
                          src={formData.logo}
                          alt="Logo preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logo: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Create Bar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}