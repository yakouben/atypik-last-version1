import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation - AtypikHouse',
  description: 'Consultez les conditions générales d\'utilisation d\'AtypikHouse. Informations légales, politique de confidentialité et CGV pour nos hébergements insolites.',
  openGraph: {
    title: 'CGU - AtypikHouse',
    description: 'Conditions générales d\'utilisation et informations légales pour AtypikHouse.',
    images: ['/hero.jpg'],
  },
};

export default function CGULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
