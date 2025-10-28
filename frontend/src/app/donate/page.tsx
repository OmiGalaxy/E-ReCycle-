'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, MapPin, Mail, Phone } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Classification, DonationOrganization, DonationCreate } from '@/types';

export default function DonatePage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [organizations, setOrganizations] = useState<DonationOrganization[]>([]);
  const [formData, setFormData] = useState<DonationCreate>({
    classification_id: 0,
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingClassifications, setLoadingClassifications] = useState(true);
  
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
    loadOrganizations();
  }, [user]);

  useEffect(() => {
    if (classificationId) {
      setFormData(prev => ({ ...prev, classification_id: parseInt(classificationId) }));
    }
  }, [classificationId]);

  const loadClassifications = async () => {
    setLoadingClassifications(true);
    try {
      const response = await apiClient.getClassifications();
      setClassifications(response.data || []);
    } catch (error) {
      console.error('Failed to load classifications:', error);
      toast.error(getErrorMessage(error) || 'Failed to load classifications');
      setClassifications([]);
    } finally {
      setLoadingClassifications(false);
    }
  };

  const loadOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await apiClient.getDonationOrganizations();
      setOrganizations(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load organizations');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classification_id || formData.classification_id === 0) {
      toast.error('Please select an item to donate');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.createDonation(formData);
      toast.success('Donation registered successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(getErrorMessage(error) || 'Failed to register donation');
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
              Donate Your Electronics
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Give your working electronics a second life by donating to organizations in need
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donation Form */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Register Donation
              </h2>
              
              {!loadingClassifications && classifications.filter(item => item.condition === 'working').length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Working Items Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You need to classify some working electronic items before you can donate them.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/classify')}
                    className="btn-primary"
                  >
                    Classify Items
                  </button>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Item */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Item to Donate
                  </label>
                  {loadingClassifications ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                      Loading items...
                    </div>
                  ) : (
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={formData.classification_id || ''}
                      onChange={(e) => setFormData({ ...formData, classification_id: parseInt(e.target.value) || 0 })}
                    >
                      <option value="">Choose an item...</option>
                      {classifications
                        .filter(item => item.condition === 'working')
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.item_name} - {item.condition}
                          </option>
                        ))}
                    </select>
                  )}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Only working items can be donated
                    {!loadingClassifications && classifications.filter(item => item.condition === 'working').length === 0 && (
                      <span className="block text-amber-600 dark:text-amber-400 mt-1">
                        No working items available. Please classify some working items first.
                      </span>
                    )}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Pickup/Drop-off Location
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your address or preferred meeting location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
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
                    disabled={loading || loadingClassifications || classifications.filter(item => item.condition === 'working').length === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registering...' : 'Register Donation'}
                  </button>
                </div>
              </form>
              )}
            </div>

            {/* Organizations List */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Partner Organizations
              </h2>
              
              {loadingOrgs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Heart className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {org.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {org.description}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              {org.type}
                            </span>
                            <MapPin className="h-4 w-4 mr-1" />
                            {org.location}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-1" />
                            <a 
                              href={`mailto:${org.contact}`}
                              className="text-primary-600 hover:text-primary-500"
                            >
                              {org.contact}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-12 card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              How Donation Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-semibold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Register Your Item
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select a working electronic item and provide pickup details
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-semibold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  We Connect You
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll match you with organizations that need your type of device
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-semibold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Make a Difference
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your donation helps bridge the digital divide in communities
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}