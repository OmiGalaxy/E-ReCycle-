'use client';

import { Star, ShoppingCart, Heart, Truck, Shield, Award } from 'lucide-react';
import { MarketplaceItem } from '@/types';

interface ProductCardProps {
  item: MarketplaceItem;
  onBuyClick: (item: MarketplaceItem) => void;
}

export default function ProductCard({ item, onBuyClick }: ProductCardProps) {
  const discount = item.original_price ? Math.round(((item.original_price - item.price) / item.original_price) * 100) : 0;
  const savings = item.original_price ? (item.original_price - item.price).toFixed(2) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img 
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="text-gray-400 text-6xl">📱</div>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
          {item.seller_rating >= 4.5 && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Award className="h-3 w-3" />
              Top Rated
            </span>
          )}
        </div>
        
        <button className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
          <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Brand & Title */}
        <div>
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {item.brand}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 mt-1">
            {item.title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Model: {item.model}
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(item.seller_rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {item.seller_rating}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Truck className="h-3 w-3" />
            <span>Free Delivery</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{item.price.toLocaleString('en-IN')}
            </span>
            {item.original_price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ₹{item.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {savings > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              Save ₹{Number(savings).toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Warranty</span>
          </div>
          <div className="flex items-center space-x-1">
            <Award className="h-3 w-3" />
            <span>Certified</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
          Sold by <span className="font-medium text-gray-700 dark:text-gray-300">{item.seller_name}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onBuyClick(item)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{item.is_selling ? 'Buy Now' : 'Contact Seller'}</span>
        </button>
      </div>
    </div>
  );
}