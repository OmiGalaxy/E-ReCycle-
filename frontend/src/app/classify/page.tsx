'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Camera, FileText, Trash2, Heart, ShoppingCart, Wrench } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import toast from 'react-hot-toast';

export default function ClassifyPage() {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    condition: 'unknown',
    category: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const conditions = [
    { value: 'working', label: 'Working', color: 'text-green-600' },
    { value: 'dead', label: 'Dead/Broken', color: 'text-red-600' },
    { value: 'unknown', label: 'Unknown', color: 'text-yellow-600' },
  ];

  const categories = [
    {
      value: 'disposal',
      label: 'Disposal',
      icon: <Trash2 className="h-6 w-6" />,
      description: 'Safely dispose of e-waste',
      color: 'bg-red-100 text-red-600 border-red-200',
    },
    {
      value: 'donate',
      label: 'Donate',
      icon: <Heart className="h-6 w-6" />,
      description: 'Give to organizations in need',
      color: 'bg-blue-100 text-blue-600 border-blue-200',
    },
    {
      value: 'marketplace',
      label: 'Marketplace',
      icon: <ShoppingCart className="h-6 w-6" />,
      description: 'Sell or buy components',
      color: 'bg-green-100 text-green-600 border-green-200',
    },
    {
      value: 'repair',
      label: 'Repair',
      icon: <Wrench className="h-6 w-6" />,
      description: 'Find repair services',
      color: 'bg-purple-100 text-purple-600 border-purple-200',
    },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    setLoading(true);
    
    try {
      // First, create the classification
      const response = await apiClient.createClassification(formData);
      const classificationId = response.data.id;
      
      // Upload image if provided
      if (image) {
        await apiClient.uploadImage(classificationId, image);
      }
      
      toast.success('Item classified successfully!');
      
      // Redirect to the appropriate module
      switch (formData.category) {
        case 'disposal':
          router.push(`/disposal?classificationId=${classificationId}`);
          break;
        case 'donate':
          router.push(`/donate?classificationId=${classificationId}`);
          break;
        case 'marketplace':
          router.push(`/marketplace?classificationId=${classificationId}`);
          break;
        case 'repair':
          router.push(`/repair?classificationId=${classificationId}`);
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Classify Your E-Waste
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Help us understand your item to provide the best recommendations
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="mb-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., iPhone 12, Dell Laptop, Samsung TV"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Describe the item, its age, any issues, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {conditions.map((condition) => (
                    <label
                      key={condition.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        formData.condition === condition.value
                          ? 'border-primary-600 ring-2 ring-primary-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value={condition.value}
                        className="sr-only"
                        checked={formData.condition === condition.value}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      />
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-medium ${condition.color}`}>
                          {condition.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  What would you like to do with this item?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <label
                      key={category.value}
                      className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all ${
                        formData.category === category.value
                          ? 'border-primary-600 ring-2 ring-primary-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        className="sr-only"
                        checked={formData.category === category.value}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          {category.icon}
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            {category.label}
                          </span>
                          <span className="block text-sm text-gray-500 dark:text-gray-400">
                            {category.description}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Classifying...' : 'Classify Item'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}