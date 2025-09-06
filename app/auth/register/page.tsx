"use client";

import { useState } from 'react';
import SignInModal from '@/components/SignInModal';
import Breadcrumb, { generateBreadcrumbs } from '@/components/Breadcrumb';

export default function RegisterPage() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    console.log('🔍 RegisterPage - handleClose called');
    setIsOpen(false);
    // Don't redirect to home page when modal is closed
    // Let the user stay on the register page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={generateBreadcrumbs('register')} />
        </div>
      </div>
      
      <SignInModal 
        isOpen={isOpen} 
        onClose={handleClose}
        initialStep="userType"
      />
    </div>
  );
} 