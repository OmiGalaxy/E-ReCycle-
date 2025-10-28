'use client';

import { Smartphone, Laptop, Home, Headphones, Gamepad2, Cable } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

const iconMap = {
  Smartphone,
  Laptop,
  Home,
  Headphones,
  Gamepad2,
  Cable
};

export default function CategorySidebar({ categories, selectedCategory, onCategorySelect }: CategorySidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedCategory === null 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All Categories
        </button>
        
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap];
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                selectedCategory === category.id 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}