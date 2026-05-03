import { redirect } from 'next/navigation';

/** Entry: browse when signed in; `AppRouteGate` sends others to `/login`. */
export default function HomePage() {
  redirect('/browse');
}
