import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirmation email - AtypikHouse',
  description: 'Confirmez votre adresse email pour activer votre compte AtypikHouse et accéder à nos hébergements insolites.',
  openGraph: {
    title: 'Confirmation email - AtypikHouse',
    description: 'Confirmez votre email pour activer votre compte.',
    images: ['/hero.jpg'],
  },
};

export default function ConfirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
