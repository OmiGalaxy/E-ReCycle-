'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Truck, Building, Star } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Classification, Vendor, DisposalCreate } from '@/types';

export default function DisposalPage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState<DisposalCreate>({
    classification_id: 0,
    disposal_method: 'pickup',
    pickup_date: '',
    pickup_location: '',
    vendor_filter: 'computers',
  });
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const classificationId = searchParams.get('classificationId');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadClassifications();
  }, [user]);

  useEffect(() => {
    if (classificationId) {
      setFormData(prev => ({ ...prev, classification_id: parseInt(classificationId) }));
    }
  }, [classificationId]);

  useEffect(() => {
    if (formData.vendor_filter) {
      loadVendors();
    }
  }, [formData.vendor_filter]);

  const loadClassifications = async () => {
    try {
      const response = await apiClient.getClassifications();
      setClassifications(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load classifications');
    }
  };

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      const response = await apiClient.getVendors(formData.vendor_filter);
      setVendors(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classification_id) {
      toast.error('Please select an item to dispose');
      return;
    }

    if (!selectedVendor) {
      toast.error('Please select a vendor');
      return;
    }

    if (formData.disposal_method === 'pickup') {
      if (!formData.pickup_date) {
        toast.error('Please select pickup date');
        return;
      }
      if (!formData.pickup_location) {
        toast.error('Please provide pickup location');
        return;
      }
    }

    setLoading(true);
    try {
      const disposalData = {
        classification_id: parseInt(formData.classification_id.toString()),
        disposal_method: formData.disposal_method,
        pickup_date: formData.pickup_date || null,
        pickup_location: formData.pickup_location || null,
        vendor_filter: formData.vendor_filter,
        selected_vendor: selectedVendor
      };
      console.log('Sending disposal data:', disposalData);
      const response = await apiClient.createDisposal(disposalData);
      console.log('Disposal response:', response);
      toast.success('Disposal scheduled successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Disposal error:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to schedule disposal');
      }
    } finally {
      setLoading(false);
    }
  };

  const vendorTypes = [
    { value: 'computers', label: 'Computers & Laptops' },
    { value: 'phones', label: 'Mobile Phones' },
    { value: 'batteries', label: 'Batteries' },
    { value: 'appliances', label: 'Home Appliances' },
  ];

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
              Schedule E-Waste Disposal
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose a certified vendor for safe disposal of your electronic waste
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Item to Dispose
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.classification_id}
                  onChange={(e) => setFormData({ ...formData, classification_id: parseInt(e.target.value) })}
                >
                  <option value="">Choose an item...</option>
                  {classifications.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} - {item.condition}
                    </option>
                  ))}
                </select>
              </div>

              {/* Disposal Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disposal Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none ${
                    formData.disposal_method === 'pickup' 
                      ? 'border-primary-600 ring-2 ring-primary-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="disposal_method"
                      value="pickup"
                      className="sr-only"
                      checked={formData.disposal_method === 'pickup'}
                      onChange={(e) => setFormData({ ...formData, disposal_method: e.target.value as 'pickup' | 'drop-off' })}
                    />
                    <div className="flex items-center space-x-3">
                      <Truck className="h-6 w-6 text-primary-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          Pickup Service
                        </span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          We'll collect from your location
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none ${
                    formData.disposal_method === 'drop-off' 
                      ? 'border-primary-600 ring-2 ring-primary-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="disposal_method"
                      value="drop-off"
                      className="sr-only"
                      checked={formData.disposal_method === 'drop-off'}
                      onChange={(e) => setFormData({ ...formData, disposal_method: e.target.value as 'pickup' | 'drop-off' })}
                    />
                    <div className="flex items-center space-x-3">
                      <Building className="h-6 w-6 text-primary-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          Drop-off
                        </span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          Bring to collection center
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Pickup Details */}
              {formData.disposal_method === 'pickup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Location
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Enter your full address for pickup"
                      value={formData.pickup_location}
                      onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Vendor Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.vendor_filter}
                  onChange={(e) => setFormData({ ...formData, vendor_filter: e.target.value })}
                >
                  {vendorTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Vendors */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Vendor *
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose a certified vendor for your e-waste disposal
                </p>
                {loadingVendors ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendors.map((vendor, index) => (
                      <label key={index} className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                        selectedVendor === vendor.name 
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="vendor"
                          value={vendor.name}
                          checked={selectedVendor === vendor.name}
                          onChange={(e) => setSelectedVendor(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {vendor.name}
                          </h4>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                              {vendor.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {vendor.location}
                        </div>
                        <div className="flex items-center justify-between">
                          {vendor.pickup && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Truck className="h-3 w-3 mr-1" />
                              Pickup Available
                            </span>
                          )}
                          {selectedVendor === vendor.name && (
                            <span className="text-primary-600 font-medium text-sm">Selected</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Scheduling...' : 'Schedule Disposal'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}