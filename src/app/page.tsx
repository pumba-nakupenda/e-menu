import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige par défaut vers la table 01 pour la démonstration
  redirect('/table/01');
}