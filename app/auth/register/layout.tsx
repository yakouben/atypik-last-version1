import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inscription - AtypikHouse',
  description: 'Créez votre compte AtypikHouse pour réserver des hébergements insolites. Inscription gratuite pour propriétaires et voyageurs.',
  openGraph: {
    title: 'Inscription - AtypikHouse',
    description: 'Créez votre compte pour réserver des hébergements insolites.',
    images: ['/hero.jpg'],
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
