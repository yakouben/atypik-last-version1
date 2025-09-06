import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Conseils voyage insolite et éco-tourisme',
  description: 'Découvrez nos articles sur l\'hébergement insolite, l\'éco-tourisme et la vie en harmonie avec la nature. Conseils de voyage et expériences uniques.',
  openGraph: {
    title: 'Blog AtypikHouse - Conseils voyage insolite',
    description: 'Articles sur l\'hébergement insolite, l\'éco-tourisme et la vie en harmonie avec la nature.',
    images: ['/hero.jpg'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
