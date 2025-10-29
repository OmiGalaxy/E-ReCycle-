'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Phone, Clock, Shield, DollarSign, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import toast from 'react-hot-toast';

interface RepairShop {
  name: string;
  address: string;
  rating: number;
  specialties: string[];
  phone: string;
  hours: string;
  warranty: string;
  price_range: string;
  reviews: Array<{
    user: string;
    rating: number;
    comment: string;
  }>;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function RepairPage() {
  const [repairShops, setRepairShops] = useState<RepairShop[]>([]);
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('phones');
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingFaq, setLoadingFaq] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedShop, setSelectedShop] = useState<RepairShop | null>(null);
  
  useEffect(() => {
    loadRepairShops();
    loadFaq();
  }, []);

  useEffect(() => {
    loadRepairShops();
  }, [selectedCategory]);

  const loadRepairShops = async () => {
    setLoadingShops(true);
    try {
      const response = await apiClient.getRepairShops(selectedCategory);
      setRepairShops(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load repair shops');
    } finally {
      setLoadingShops(false);
    }
  };

  const loadFaq = async () => {
    setLoadingFaq(true);
    try {
      const response = await apiClient.getRepairFaq();
      setFaq(response.data);
    } catch (error) {
      console.error('Failed to load FAQ:', error);
    } finally {
      setLoadingFaq(false);
    }
  };

  const repairTypes = [
    { value: 'phones', label: 'Mobile Phones', icon: '📱' },
    { value: 'computers', label: 'Computers & Laptops', icon: '💻' },
    { value: 'appliances', label: 'Home Appliances', icon: '🏠' },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactShop = (shop: RepairShop) => {
    // Show Indian phone number in toast and open dialer
    toast.success(`Calling ${shop.name} at ${shop.phone}`);
    window.open(`tel:${shop.phone}`);
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Repair Services Directory
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find trusted repair shops with reviews, pricing, and warranty information
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
              {repairTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedCategory(type.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === type.value
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Repair Shops */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {repairTypes.find(t => t.value === selectedCategory)?.label} Repair Shops
            </h2>
            
            {loadingShops ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {repairShops.map((shop, index) => (
                  <div key={index} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {shop.name}
                      </h3>
                      <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {shop.rating}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        {shop.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        {shop.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        {shop.hours}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                        {shop.price_range}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                        {shop.warranty} warranty
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Specialties:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {shop.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reviews Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Recent Reviews:
                      </h4>
                      <div className="space-y-2">
                        {shop.reviews.slice(0, 2).map((review, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-gray-900 dark:text-white mr-2">
                                {review.user}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button 
                        onClick={() => handleContactShop(shop)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQ Section */}
          <div className="card mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            
            {loadingFaq ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {faq.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-4 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.question}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              How to Choose a Repair Shop
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Check Reviews
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read customer reviews and ratings to gauge service quality
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Compare Prices
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get quotes from multiple shops to find the best value
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Verify Warranty
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ensure the shop offers warranty on repairs and parts
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}