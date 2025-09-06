import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Propriétés - AtypikHouse',
  description: 'Découvrez nos propriétés insolites : cabanes dans les arbres, yourtes et cabanes flottantes. Réservez votre séjour unique.',
  openGraph: {
    title: 'Propriétés insolites - AtypikHouse',
    description: 'Découvrez nos propriétés insolites et réservez votre séjour.',
    images: ['/hero.jpg'],
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
