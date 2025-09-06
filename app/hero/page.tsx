"use client";

import HeroSection from '@/components/HeroSection';
import { useRouter } from 'next/navigation';

export default function HeroPage() {
  const router = useRouter();

  const handleReserverClick = () => {
    router.push('/search');
  };

  const handleAddPropertyClick = () => {
    router.push('/host');
  };

  const handleConnexionClick = () => {
    router.push('/auth/login');
  };

  const handleInscriptionClick = () => {
    router.push('/auth/register');
  };

  return (
    <div>
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">AtypikHouse - Découvrez nos hébergements insolites</h1>
      
      <HeroSection
        onReserverClick={handleReserverClick}
        onAddPropertyClick={handleAddPropertyClick}
        onConnexionClick={handleConnexionClick}
        onInscriptionClick={handleInscriptionClick}
      />
    </div>
  );
} 