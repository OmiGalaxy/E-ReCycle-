'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Truck, Calendar, Download, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    itemTitle: string;
    price: number;
    estimatedDelivery: string;
    purchaseId?: number;
  } | null;
}

export default function PurchaseSuccessModal({ isOpen, onClose, orderDetails }: PurchaseSuccessModalProps) {
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  
  if (!orderDetails) return null;
  
  const handleDownloadReceipt = async () => {
    if (!orderDetails.purchaseId) {
      toast.error('Purchase ID not available');
      return;
    }
    
    setDownloadingReceipt(true);
    try {
      const response = await apiClient.downloadReceipt(orderDetails.purchaseId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ECycle_Receipt_${orderDetails.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Success Animation */}
            <div className="text-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <Package className="h-4 w-4 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Purchase Successful! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Thank you for your purchase. Your order has been confirmed and will be processed shortly.
                </p>
              </motion.div>

              {/* Order Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 text-left"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">#{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Item:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{orderDetails.itemTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                    <span className="text-green-600 font-bold">₹{Math.round(orderDetails.price).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
              >
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <Truck className="h-5 w-5" />
                  <span className="text-sm font-medium">Estimated Delivery</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-semibold">{orderDetails.estimatedDelivery}</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <button 
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt || !orderDetails.purchaseId}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {downloadingReceipt ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download Receipt</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-xs text-gray-500 dark:text-gray-400"
              >
                <p>You will receive an email confirmation shortly.</p>
                <p>Track your order in the "My Orders" section.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}