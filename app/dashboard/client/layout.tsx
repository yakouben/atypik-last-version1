import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord client - AtypikHouse',
  description: 'Découvrez et réservez des hébergements insolites depuis votre tableau de bord client AtypikHouse.',
  openGraph: {
    title: 'Tableau de bord client - AtypikHouse',
    description: 'Découvrez et réservez des hébergements insolites.',
    images: ['/hero.jpg'],
  },
};

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
