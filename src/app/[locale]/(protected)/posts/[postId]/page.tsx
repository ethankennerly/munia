'use client';

import { Post } from '@/components/Post';
import { DeletePostButton } from '@/components/DeletePostButton';
import { useCallback, useState, use } from 'react';

export default function Page({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.postId, 10);
  const [commentsShown, setCommentsShown] = useState(true);

  const toggleComments = useCallback(() => setCommentsShown((prev) => !prev), []);

  return (
    <main>
      <div className="m-4">
        <Post id={postId} commentsShown={commentsShown} toggleComments={toggleComments} />
        <DeletePostButton postId={postId} />
      </div>
    </main>
  );
}
