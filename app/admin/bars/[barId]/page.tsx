'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';

interface Drink {
  id?: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  abv: number;
  strength: string;
  imageUrl?: string;
  image_url?: string;
  active: boolean;
  inStock?: boolean;
  flavorProfile?: string[];
  flavor_profile?: string[];
  servingSuggestions?: string[];
  serving_suggestions?: string[];
  glassType?: string;
  glass_type?: string;
  weatherMatch?: string;
  weather_match?: string;
}

interface Bar {
  id: string;
  name: string;
  slug: string;
}

export default function BarDrinksPage() {
  const params = useParams();
  const router = useRouter();
  const barId = params.barId as string;

  const [bar, setBar] = useState<Bar | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Drink | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cocktail',
    description: '',
    price: '',
    abv: '',
    strength: 'medium',
    imageUrl: '',
  });

  const fetchBarAndDrinks = useCallback(async () => {
    try {
      const [barRes, drinksRes] = await Promise.all([
        fetch(`/api/bars/${barId}`),
        fetch(`/api/bars/${barId}/drinks`),
      ]);

      if (barRes.ok && drinksRes.ok) {
        const barData = await barRes.json();
        const drinksData = await drinksRes.json();
        setBar(barData);
        setDrinks(drinksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [barId]);

  useEffect(() => {
    fetchBarAndDrinks();
  }, [fetchBarAndDrinks]);

  const handleCreateDrink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/bars/${barId}/drinks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          abv: parseFloat(formData.abv) || 0,
        }),
      });

      if (response.ok) {
        await fetchBarAndDrinks();
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating drink:', error);
    }
  };

  const handleUpdateDrink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    try {
      // Clean the update data - remove fields that shouldn't be updated
      const cleanedUpdates = { ...editFormData };
      delete cleanedUpdates.id;
      delete (cleanedUpdates as Record<string, unknown>).barId;
      delete (cleanedUpdates as Record<string, unknown>).bar;
      delete (cleanedUpdates as Record<string, unknown>).createdAt;
      delete (cleanedUpdates as Record<string, unknown>).updatedAt;
      delete (cleanedUpdates as Record<string, unknown>).inventory;
      delete (cleanedUpdates as Record<string, unknown>)._count;

      // Transform field names to match database schema
      const dataToSend = {
        ...cleanedUpdates,
        // Ensure these fields use the correct database field names
        imageUrl: cleanedUpdates.imageUrl || cleanedUpdates.image_url,
        flavorProfile: cleanedUpdates.flavorProfile || cleanedUpdates.flavor_profile || [],
        servingSuggestions: cleanedUpdates.servingSuggestions || cleanedUpdates.serving_suggestions || [],
        glassType: cleanedUpdates.glassType || cleanedUpdates.glass_type,
        weatherMatch: cleanedUpdates.weatherMatch || cleanedUpdates.weather_match,
        // Remove any snake_case duplicates
        image_url: undefined,
        flavor_profile: undefined,
        serving_suggestions: undefined,
        glass_type: undefined,
        weather_match: undefined,
      };

      const response = await fetch(`/api/bars/${barId}/drinks/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        await fetchBarAndDrinks();
        setShowEditModal(false);
        setEditFormData(null);
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
        alert(`Failed to update drink: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating drink:', error);
      alert('Failed to update drink. Please try again.');
    }
  };

  const handleDeleteDrink = async (drinkId: string) => {
    if (!confirm('Are you sure you want to delete this drink?')) return;

    try {
      const response = await fetch(`/api/bars/${barId}/drinks/${drinkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBarAndDrinks();
      }
    } catch (error) {
      console.error('Error deleting drink:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'cocktail',
      description: '',
      price: '',
      abv: '',
      strength: 'medium',
      imageUrl: '',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editFormData) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditFormData({ ...editFormData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleEditDrink = (drink: Drink) => {
    setEditFormData({ ...drink });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bars
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bar?.name} - Drinks</h1>
              <p className="text-sm text-gray-500">Manage drinks for /{bar?.slug}</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Drink
            </button>
          </div>

          <div className="p-6">
            {drinks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No drinks added yet. Click Add Drink to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {drinks.map((drink) => (
                  <div key={drink.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col h-full">
                      <div className="flex gap-4 flex-1">
                        {drink.imageUrl && (
                          <img
                            src={drink.imageUrl}
                            alt={drink.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-gray-600 font-semibold text-lg">{drink.name}</h3>
                          <p className="text-sm text-gray-500">
                            {drink.category} • ${drink.price} • {drink.abv}% ABV • {drink.strength}
                          </p>
                          {drink.description && (
                            <p className="text-gray-600 mt-1 text-sm">{drink.description}</p>
                          )}
                          <div className="flex gap-3 mt-2">
                            <span className={`text-sm ${drink.inStock !== false ? 'text-green-600' : 'text-red-600'}`}>
                              {drink.inStock !== false ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Buttons at bottom in 50/50 layout */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditDrink(drink)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => drink.id && handleDeleteDrink(drink.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Drink Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Drink</h2>
              <form onSubmit={handleCreateDrink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drink Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="cocktail">Cocktail</option>
                      <option value="beer">Beer</option>
                      <option value="wine">Wine</option>
                      <option value="spirit">Spirit</option>
                      <option value="non-alcoholic">Non-Alcoholic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strength *
                    </label>
                    <select
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="non-alcoholic">Non-Alcoholic</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="10.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ABV %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.abv}
                      onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="12.5"
                    />
                  </div>
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
                    Drink Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {formData.imageUrl && (
                      <div className="relative w-32 h-32">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
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
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Drink
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Drink Modal */}
        {showEditModal && editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Drink</h2>
              <form onSubmit={handleUpdateDrink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drink Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="cocktail">Cocktail</option>
                      <option value="beer">Beer</option>
                      <option value="wine">Wine</option>
                      <option value="spirit">Spirit</option>
                      <option value="non-alcoholic">Non-Alcoholic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strength *
                    </label>
                    <select
                      value={editFormData.strength}
                      onChange={(e) => setEditFormData({ ...editFormData, strength: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="non-alcoholic">Non-Alcoholic</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="10.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ABV %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFormData.abv}
                      onChange={(e) => setEditFormData({ ...editFormData, abv: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="12.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.inStock !== false}
                      onChange={(e) => setEditFormData({ ...editFormData, inStock: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drink Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {editFormData.imageUrl && (
                      <div className="relative w-32 h-32">
                        <img
                          src={editFormData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, imageUrl: '' })}
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
                      setShowEditModal(false);
                      setEditFormData(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Update Drink
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