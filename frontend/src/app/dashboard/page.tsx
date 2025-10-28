'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Heart, ShoppingCart, Wrench, Calendar, MapPin, X, CheckCircle, Eye, Info } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Classification, Disposal, Donation, MarketplaceItem } from '@/types';

export default function DashboardPage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Classification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        apiClient.getClassifications(),
        apiClient.getDisposals(),
        apiClient.getDonations(),
        apiClient.getMyMarketplaceItems(),
      ]);

      if (results[0].status === 'fulfilled') {
        setClassifications(results[0].value.data || []);
      }
      if (results[1].status === 'fulfilled') {
        setDisposals(results[1].value.data || []);
      }
      if (results[2].status === 'fulfilled') {
        setDonations(results[2].value.data || []);
      }
      if (results[3].status === 'fulfilled') {
        setMarketplaceItems(results[3].value.data || []);
      }

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassificationName = (classificationId: number) => {
    const classification = classifications.find(c => c.id === classificationId);
    return classification ? classification.item_name : 'Unknown Item';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleItemClick = (item: Classification) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getItemStatus = (item: Classification) => {
    // For demo purposes, show some items as approved based on ID
    const isApproved = item.id % 3 === 0; // Every 3rd item is approved
    return isApproved ? 'approved' : 'pending';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your e-waste activities and track your environmental impact
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => router.push('/classify')}
              className="card hover:shadow-md transition-shadow p-6 text-center"
            >
              <Plus className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Classify Item
              </span>
            </button>
            
            <button
              onClick={() => router.push('/disposal')}
              className="card hover:shadow-md transition-shadow p-6 text-center"
            >
              <Trash2 className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Schedule Disposal
              </span>
            </button>
            
            <button
              onClick={() => router.push('/donate')}
              className="card hover:shadow-md transition-shadow p-6 text-center"
            >
              <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Donate Items
              </span>
            </button>
            
            <button
              onClick={() => router.push('/marketplace')}
              className="card hover:shadow-md transition-shadow p-6 text-center"
            >
              <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Marketplace
              </span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Plus className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Items Classified
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {classifications.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Disposals Scheduled
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {disposals.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Items Donated
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {donations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Marketplace Items
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {marketplaceItems.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Classifications */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Classifications
              </h2>
              {classifications.length === 0 ? (
                <div className="text-center py-8">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No items classified yet. Start by classifying your first item!
                  </p>
                  <button
                    onClick={() => router.push('/classify')}
                    className="mt-4 btn-primary"
                  >
                    Classify Item
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {classifications.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Eye className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.item_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.condition} • {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.created_at)}
                        </span>
                        {getItemStatus(item) === 'approved' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <Info className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Activities
              </h2>
              <div className="space-y-4">
                {/* Disposals */}
                {disposals.slice(0, 3).map((disposal) => (
                  <div key={`disposal-${disposal.id}`} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Disposal scheduled for {getClassificationName(disposal.classification_id)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {disposal.disposal_method} • {disposal.status}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Donations */}
                {donations.slice(0, 3).map((donation) => (
                  <div key={`donation-${donation.id}`} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Donated {getClassificationName(donation.classification_id)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {donation.status}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Marketplace Items */}
                {marketplaceItems.slice(0, 2).map((item) => (
                  <div key={`marketplace-${item.id}`} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Listed {getClassificationName(item.classification_id)} for ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.is_selling ? 'Selling' : 'Buying'} • {item.status}
                      </p>
                    </div>
                  </div>
                ))}



                {(disposals.length === 0 && donations.length === 0 && marketplaceItems.length === 0) && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activities. Start by classifying an item!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Item Details Modal */}
        <AnimatePresence>
          {showModal && selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Item Details
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Classification Information
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="space-y-6">
                    {/* Item Image */}
                    {selectedItem.image_path && (
                      <div className="flex justify-center">
                        <img
                          src={selectedItem.image_path}
                          alt={selectedItem.item_name}
                          className="w-48 h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )}

                    {/* Item Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Item Name
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedItem.item_name}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Condition
                        </label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedItem.condition === 'working' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : selectedItem.condition === 'dead'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {selectedItem.condition.charAt(0).toUpperCase() + selectedItem.condition.slice(1)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {selectedItem.category}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date Classified
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(selectedItem.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        {selectedItem.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={`p-4 rounded-lg ${
                      getItemStatus(selectedItem) === 'approved'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {getItemStatus(selectedItem) === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                        <span className={`font-medium ${
                          getItemStatus(selectedItem) === 'approved'
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-yellow-900 dark:text-yellow-100'
                        }`}>
                          Classification Status: {getItemStatus(selectedItem) === 'approved' ? 'Approved' : 'Pending Review'}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${
                        getItemStatus(selectedItem) === 'approved'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {getItemStatus(selectedItem) === 'approved'
                          ? 'This item has been approved and is ready for the next step in the e-waste management process.'
                          : 'This item is currently under review by our team. You will be notified once it is approved.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}