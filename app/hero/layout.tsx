import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Découvrez nos hébergements insolites - AtypikHouse',
  description: 'Explorez notre collection d\'hébergements insolites : cabanes dans les arbres, yourtes et cabanes flottantes en Europe.',
  openGraph: {
    title: 'Hébergements insolites - AtypikHouse',
    description: 'Découvrez nos hébergements insolites en Europe.',
    images: ['/hero.jpg'],
  },
};

export default function HeroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
