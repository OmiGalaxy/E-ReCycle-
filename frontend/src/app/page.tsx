'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Recycle, Trash2, Heart, ShoppingCart, Wrench, Shield, Leaf, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Remove auto-redirect to allow home page access for logged-in users
  const features = [
    {
      icon: <Trash2 className="h-8 w-8" />,
      title: 'Smart Classification',
      description: 'AI-powered waste categorization for proper disposal and recycling.',
    },
    {
      icon: <Recycle className="h-8 w-8" />,
      title: 'Disposal Management',
      description: 'Connect with certified vendors for safe e-waste disposal.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Donation Platform',
      description: 'Give working electronics a second life through donations.',
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: 'Marketplace',
      description: 'Buy and sell electronic components in our secure marketplace.',
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: 'Repair Services',
      description: 'Find trusted repair shops to extend your devices\' lifespan.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Process',
      description: 'End-to-end security for all your e-waste management needs.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Environmental Coordinator',
      content: 'E-Cycle has transformed how our company handles e-waste. The platform is intuitive and the service is exceptional.',
      avatar: '/avatars/sarah.jpg',
    },
    {
      name: 'Mike Chen',
      role: 'IT Manager',
      content: 'The marketplace feature helped us find quality refurbished components at great prices. Highly recommended!',
      avatar: '/avatars/mike.jpg',
    },
    {
      name: 'Emily Davis',
      role: 'Sustainability Officer',
      content: 'Finally, a comprehensive solution for e-waste management. The donation feature is particularly impressive.',
      avatar: '/avatars/emily.jpg',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Sustainable <span className="text-primary-600">E-Waste</span> Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your electronic waste into opportunities. Classify, dispose, donate, buy, sell, and repair - all in one comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? "/dashboard" : "/classify"} className="btn-primary text-lg px-8 py-4">
                {user ? "Go to Dashboard" : "Start Classifying"}
              </Link>
              <Link href="/marketplace" className="btn-secondary text-lg px-8 py-4">
                Explore Marketplace
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete E-Waste Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform offers everything you need for responsible e-waste management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Items Recycled</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Happy Users</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Partner Vendors</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of satisfied users making a difference
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of environmentally conscious users and start your e-waste management journey today.
            </p>
            <Link href={user ? "/dashboard" : "/register"} className="btn-primary text-lg px-8 py-4">
              {user ? "Go to Dashboard" : "Get Started Now"}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}