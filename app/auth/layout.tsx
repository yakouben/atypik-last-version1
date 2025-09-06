import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion - AtypikHouse',
  description: 'Connectez-vous à votre compte AtypikHouse pour réserver vos hébergements insolites. Accès propriétaire et client disponible.',
  openGraph: {
    title: 'Connexion - AtypikHouse',
    description: 'Connectez-vous pour réserver vos hébergements insolites.',
    images: ['/hero.jpg'],
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
