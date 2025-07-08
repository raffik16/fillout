'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, LogOut, User, Users, Settings, Wine } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Bar {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
  logo?: string;
  active: boolean;
  users?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  _count?: {
    drinks: number;
    users: number;
  };
}

interface UserData {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  bars?: {
    bar: {
      id: string;
      name: string;
      slug: string;
    };
    role: string;
  }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bars' | 'users'>('bars');
  const [bars, setBars] = useState<Bar[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showEditBarForm, setShowEditBarForm] = useState(false);
  const [editingBar, setEditingBar] = useState<Bar | null>(null);
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
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    barAssignments: [] as { barId: string; role: string }[],
  });

  useEffect(() => {
    fetchBars();
    // Only fetch users if the current user is a superadmin
    if (session?.user?.role === 'superadmin') {
      fetchUsers();
    }
  }, [session?.user?.role]);

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

  const handleUpdateBar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBar) return;

    try {
      const response = await fetch(`/api/bars/${editingBar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchBars();
        setShowEditBarForm(false);
        setEditingBar(null);
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
      } else {
        const error = await response.json();
        alert(`Failed to update bar: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating bar:', error);
      alert('Failed to update bar');
    }
  };

  const handleEditBar = (bar: Bar) => {
    setEditingBar(bar);
    setFormData({
      name: bar.name,
      slug: bar.slug,
      description: bar.description || '',
      location: bar.location || '',
      email: '', // These fields might not be present in Bar interface
      phone: '',
      website: '',
      logo: bar.logo || '',
    });
    setShowEditBarForm(true);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', data.error || 'Unknown error');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that non-superadmin users have at least one bar assignment
    if (userFormData.role !== 'superadmin' && userFormData.barAssignments.length === 0) {
      alert('At least one bar assignment is required for regular users');
      return;
    }
    
    // Validate that all bar assignments have both bar and role selected
    for (const assignment of userFormData.barAssignments) {
      if (!assignment.barId || !assignment.role) {
        alert('Please select both bar and role for all assignments');
        return;
      }
    }
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        await fetchUsers();
        setShowUserForm(false);
        setUserFormData({
          name: '',
          email: '',
          role: 'user',
          password: '',
          barAssignments: [],
        });
      } else {
        const error = await response.json();
        alert(`Failed to create user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Validate that non-superadmin users have at least one bar assignment
    if (userFormData.role !== 'superadmin' && userFormData.barAssignments.length === 0) {
      alert('At least one bar assignment is required for regular users');
      return;
    }
    
    // Validate that all bar assignments have both bar and role selected
    for (const assignment of userFormData.barAssignments) {
      if (!assignment.barId || !assignment.role) {
        alert('Please select both bar and role for all assignments');
        return;
      }
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        await fetchUsers();
        setEditingUser(null);
        setShowUserForm(false);
        setUserFormData({
          name: '',
          email: '',
          role: 'user',
          password: '',
          barAssignments: [],
        });
      } else {
        const error = await response.json();
        alert(`Failed to update user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '', // Don't populate password for security
      barAssignments: user.bars ? user.bars.map(userBar => ({
        barId: userBar.bar.id,
        role: userBar.role
      })) : [],
    });
    setShowUserForm(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Add bar assignment
  const addBarAssignment = () => {
    setUserFormData({
      ...userFormData,
      barAssignments: [...userFormData.barAssignments, { barId: '', role: 'viewer' }]
    });
  };

  // Remove bar assignment
  const removeBarAssignment = (index: number) => {
    setUserFormData({
      ...userFormData,
      barAssignments: userFormData.barAssignments.filter((_, i) => i !== index)
    });
  };

  // Update bar assignment
  const updateBarAssignment = (index: number, field: 'barId' | 'role', value: string) => {
    const updatedAssignments = userFormData.barAssignments.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    );
    setUserFormData({
      ...userFormData,
      barAssignments: updatedAssignments
    });
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
            {/* Tabs */}
            <div className="flex space-x-8 mb-6">
              <button
                onClick={() => setActiveTab('bars')}
                className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm ${
                  activeTab === 'bars'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Bar Management
              </button>
              {session?.user?.role === 'superadmin' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  User Management
                </button>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'bars' ? 'Bar Management' : 'User Management'}
              </h1>
              <div className="flex items-center gap-4">
                {activeTab === 'bars' && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Bar
                  </button>
                )}
                {activeTab === 'users' && session?.user?.role === 'superadmin' && (
                  <button
                    onClick={() => {
                      setShowUserForm(true);
                      // Add default bar assignment for new users
                      if (userFormData.barAssignments.length === 0) {
                        setUserFormData({
                          ...userFormData,
                          barAssignments: [{ barId: '', role: 'viewer' }]
                        });
                      }
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add User
                  </button>
                )}
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
            {activeTab === 'bars' && (
              <>
                {bars.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No bars created yet. Click "Add Bar" to get started.
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
                          <h3 className="text-gray-600 font-semibold text-lg">{bar.name}</h3>
                          <p className="text-sm text-gray-500">/{bar.slug}</p>
                          {bar.description && (
                            <p className="text-gray-600 mt-2">{bar.description}</p>
                          )}
                          {bar.location && (
                            <p className="text-sm text-gray-500 mt-1">📍 {bar.location}</p>
                          )}
                          {bar.users && bar.users.length > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                              👤 Owner: {bar.users[0].user.name || bar.users[0].user.email}
                            </p>
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
                        <button
                          onClick={() => handleEditBar(bar)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit bar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <a
                          href={`/admin/bars/${bar.id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Manage drinks"
                        >
                          <Wine className="w-5 h-5" />
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
              </>
            )}

            {activeTab === 'users' && session?.user?.role === 'superadmin' && (
              <>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No users created yet. Click "Add User" to get started.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-gray-600 font-semibold text-lg">{user.name || 'No name'}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'superadmin' ? 'Super Admin' : 'User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Created: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {/* Bar Assignments */}
                            <div className="mt-3">
                              {user.role === 'superadmin' ? (
                                <div className="text-xs text-gray-500">
                                  📊 Access to all bars (Super Admin)
                                </div>
                              ) : user.bars && user.bars.length > 0 ? (
                                <div>
                                  <div className="text-xs text-gray-600 mb-1">Bar Access:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {user.bars.map((userBar, index) => (
                                      <span 
                                        key={index}
                                        className={`px-2 py-1 text-xs rounded-full ${
                                          userBar.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                                          userBar.role === 'manager' ? 'bg-green-100 text-green-800' :
                                          userBar.role === 'staff' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}
                                      >
                                        {userBar.bar.name} ({userBar.role})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-red-600">
                                  ⚠️ No bar assignments
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            {user.id !== session?.user?.id && (
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
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

        {/* Edit Bar Modal */}
        {showEditBarForm && editingBar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Edit Bar</h2>
              <form onSubmit={handleUpdateBar} className="space-y-4">
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
                    onClick={() => {
                      setShowEditBarForm(false);
                      setEditingBar(null);
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
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Update Bar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create/Edit User Modal */}
        {showUserForm && session?.user?.role === 'superadmin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="User's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Global role only for superadmin */}
                {session?.user?.role === 'superadmin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Role
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="user">Regular User</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Super Admin has access to all bars and system settings
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser ? '(leave empty to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter password"
                  />
                </div>

                {/* Bar Assignments - Required for non-superadmin users */}
                {userFormData.role !== 'superadmin' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Bar Access & Roles *
                      </label>
                      <button
                        type="button"
                        onClick={addBarAssignment}
                        className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Bar
                      </button>
                    </div>
                    
                    {userFormData.barAssignments.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 mb-2">No bar assignments yet</p>
                        <p className="text-xs text-red-600">At least one bar assignment is required</p>
                        <button
                          type="button"
                          onClick={addBarAssignment}
                          className="mt-2 text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded hover:bg-orange-100 transition-colors"
                        >
                          Add First Bar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userFormData.barAssignments.map((assignment, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <select
                              value={assignment.barId}
                              onChange={(e) => updateBarAssignment(index, 'barId', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              required
                            >
                              <option value="">Select Bar</option>
                              {bars.map(bar => (
                                <option key={bar.id} value={bar.id}>
                                  {bar.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={assignment.role}
                              onChange={(e) => updateBarAssignment(index, 'role', e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              required
                            >
                              <option value="viewer">Viewer</option>
                              <option value="staff">Staff</option>
                              <option value="manager">Manager</option>
                              <option value="owner">Owner</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeBarAssignment(index)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      setUserFormData({
                        name: '',
                        email: '',
                        role: 'user',
                        password: '',
                        barAssignments: [],
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
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