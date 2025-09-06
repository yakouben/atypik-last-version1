import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes réservations - AtypikHouse',
  description: 'Consultez et gérez toutes vos réservations de propriétés insolites depuis votre tableau de bord propriétaire.',
  openGraph: {
    title: 'Mes réservations - AtypikHouse',
    description: 'Gérez vos réservations de propriétés insolites.',
    images: ['/hero.jpg'],
  },
};

export default function OwnerReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
