import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { username: string } }) {
  // Redirect one level down to posts tab
  redirect(`${params.username}/posts`);
}
