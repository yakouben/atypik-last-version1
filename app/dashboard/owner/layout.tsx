import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord propriétaire - AtypikHouse',
  description: 'Gérez vos propriétés insolites, réservations et revenus depuis votre tableau de bord propriétaire AtypikHouse.',
  openGraph: {
    title: 'Tableau de bord propriétaire - AtypikHouse',
    description: 'Gérez vos propriétés insolites et réservations.',
    images: ['/hero.jpg'],
  },
};

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
