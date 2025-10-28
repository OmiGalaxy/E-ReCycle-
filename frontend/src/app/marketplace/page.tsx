'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Search, Filter, Grid, List } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Classification, MarketplaceItem, MarketplaceItemCreate, ProductCategory, PurchaseFormData } from '@/types';
import ProductCard from '@/components/marketplace/ProductCard';
import CategorySidebar from '@/components/marketplace/CategorySidebar';
import SellItemForm from '@/components/marketplace/SellItemForm';
import PurchaseModal from '@/components/marketplace/PurchaseModal';
import PurchaseSuccessModal from '@/components/marketplace/PurchaseSuccessModal';

export default function MarketplacePage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'selling' | 'buying'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const classificationId = searchParams.get('classificationId');

  useEffect(() => {
    loadCategories();
    loadMarketplaceItems();
    if (user) {
      loadClassifications();
    }
  }, [user]);

  useEffect(() => {
    if (classificationId) {
      setFormData(prev => ({ ...prev, classification_id: parseInt(classificationId) }));
      setShowCreateForm(true);
    }
  }, [classificationId]);

  useEffect(() => {
    loadMarketplaceItems();
  }, [filter, selectedCategory]);

  const loadClassifications = async () => {
    try {
      const response = await apiClient.getClassifications();
      setClassifications(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load classifications');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load categories');
    }
  };

  const loadMarketplaceItems = async () => {
    setLoadingItems(true);
    try {
      const isSelling = filter === 'all' ? undefined : filter === 'selling';
      const response = await apiClient.getMarketplaceItems(isSelling, selectedCategory || undefined);
      setMarketplaceItems(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load marketplace items');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async (data: MarketplaceItemCreate) => {
    setLoading(true);
    try {
      await apiClient.createMarketplaceItem(data);
      toast.success('Item listed successfully!');
      setShowCreateForm(false);
      loadMarketplaceItems();
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (item: MarketplaceItem) => {
    if (!user) {
      toast.error('Please login to purchase items');
      router.push('/login');
      return;
    }
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const handlePurchase = async (purchaseData: PurchaseFormData) => {
    setPurchaseLoading(true);
    try {
      const response = await apiClient.purchaseItem(purchaseData);
      
      // Generate order details
      const orderDetails = {
        orderId: `ECY${response.data.id.toString().padStart(6, '0')}`,
        itemTitle: selectedItem?.title || '',
        price: (selectedItem?.price || 0) * 1.18, // Including 18% GST
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        purchaseId: response.data.id
      };
      
      setOrderDetails(orderDetails);
      setShowPurchaseModal(false);
      setShowSuccessModal(true);
      loadMarketplaceItems(); // Refresh items to update availability
      
      toast.success('Purchase completed successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to complete purchase');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setOrderDetails(null);
  };

  const filteredAndSortedItems = marketplaceItems
    .filter(item => 
      searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.seller_rating - a.seller_rating;
        case 'discount':
          const discountA = a.original_price ? ((a.original_price - a.price) / a.original_price) * 100 : 0;
          const discountB = b.original_price ? ((b.original_price - b.price) / b.original_price) * 100 : 0;
          return discountB - discountA;
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Electronics Marketplace
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Buy and sell electronic devices with confidence
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Sell Your Item</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Login to Sell</span>
                </button>
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'selling' | 'buying')}
              >
                <option value="all">All Items</option>
                <option value="selling">For Sale</option>
                <option value="buying">Wanted</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Deals</option>
              </select>
              
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'} transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'} transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sell Item Form */}
          {showCreateForm && user && (
            <div className="mb-8">
              <SellItemForm
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => setShowCreateForm(false)}
                loading={loading}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {filter === 'all' ? 'All Products' : filter === 'selling' ? 'Products for Sale' : 'Products Wanted'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredAndSortedItems.length} items found
                    {selectedCategory && categories.find(c => c.id === selectedCategory) && 
                      ` in ${categories.find(c => c.id === selectedCategory)?.name}`
                    }
                  </p>
                </div>
              </div>
              
              {loadingItems ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : filteredAndSortedItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No products found. Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
                }>
                  {filteredAndSortedItems.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onBuyClick={handleBuyClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Purchase Modal */}
        <PurchaseModal
          item={selectedItem}
          isOpen={showPurchaseModal}
          onClose={closePurchaseModal}
          onPurchase={handlePurchase}
          loading={purchaseLoading}
        />
        
        {/* Success Modal */}
        <PurchaseSuccessModal
          isOpen={showSuccessModal}
          onClose={closeSuccessModal}
          orderDetails={orderDetails}
        />
      </div>
    </div>
  );
}