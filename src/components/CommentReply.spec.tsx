import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommentReply } from './CommentReply';

describe('CommentReply', () => {
  it('wraps long unbroken words by having min-w-0 flex-1 on container', () => {
    const longWord = 'a'.repeat(200);
    const { container } = render(
      <CommentReply
        id={1}
        content={longWord}
        createdAt={new Date()}
        user={{ id: 1, name: 'Test', username: 'test', profilePhoto: null }}
        isOwnReply={false}
        isLiked={false}
        _count={{ commentLikes: 0, replies: 0 }}
        handleEdit={() => {}}
        handleDelete={() => {}}
        likeComment={() => {}}
        unLikeComment={() => {}}
      />,
    );
    const containerDiv = container.querySelector('.min-w-0.flex-1');
    expect(containerDiv).toBeInTheDocument();
  });
});
