import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { username: string } }) {
  const { username } = await params;
  // Redirect one level down to posts tab
  redirect(`${username}/posts`);
}
