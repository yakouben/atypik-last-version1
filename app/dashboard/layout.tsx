import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - AtypikHouse',
  description: 'Accédez à votre tableau de bord AtypikHouse pour gérer vos réservations et propriétés insolites.',
  openGraph: {
    title: 'Tableau de bord - AtypikHouse',
    description: 'Gérez vos réservations et propriétés insolites.',
    images: ['/hero.jpg'],
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
