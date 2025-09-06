import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Détails propriété - AtypikHouse',
  description: 'Découvrez les détails de cette propriété insolite. Photos, équipements, localisation et réservation en ligne.',
  openGraph: {
    title: 'Propriété insolite - AtypikHouse',
    description: 'Découvrez cette propriété insolite et réservez votre séjour.',
    images: ['/hero.jpg'],
  },
};

export default function PropertyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
