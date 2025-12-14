/* eslint-disable @typescript-eslint/no-explicit-any, prettier/prettier */
import { describe, it, expect } from 'vitest';
import { computePageParams, rebuildAfterRemoval } from './infiniteUtils';

type PostId = { id: number; commentsShown: boolean };

describe('infiniteUtils', () => {
  describe('computePageParams', () => {
    it('returns [] for no pages', () => {
      expect(computePageParams([])).toEqual([]);
    });
    it('aligns pageParams to pages length', () => {
      const pages: PostId[][] = [
        [
          { id: 1, commentsShown: false },
          { id: 2, commentsShown: false },
        ],
        [
          { id: 3, commentsShown: false },
        ],
      ];
      // first undefined, then last id of preceding page (2)
      expect(computePageParams(pages)).toEqual([undefined, 2]);
    });
    it('handles empty first page gracefully', () => {
      const pages: PostId[][] = [[], [{ id: 3, commentsShown: false }]];
      expect(computePageParams(pages)).toEqual([undefined]);
    });
  });

  describe('rebuildAfterRemoval', () => {
    const makeData = (pages: PostId[][]) => ({ pages, pageParams: [] as unknown[] });

    it('returns undefined when oldData is undefined', () => {
      expect(rebuildAfterRemoval(undefined as any, 1, 10)).toBeUndefined();
    });

    it('removes the only post and returns empty structures', () => {
      const oldData = makeData([[{ id: 1, commentsShown: false }]]);
      const rebuilt = rebuildAfterRemoval(oldData, 1, 10)!;
      expect(rebuilt.pages).toEqual([]);
      expect(rebuilt.pageParams).toEqual([]);
    });

    it('rechunks pages after removal and aligns pageParams', () => {
      const oldData = makeData([
        [
          { id: 1, commentsShown: false },
          { id: 2, commentsShown: false },
        ],
        [
          { id: 3, commentsShown: false },
          { id: 4, commentsShown: false },
        ],
      ]);
      const rebuilt = rebuildAfterRemoval(oldData, 3, 2)!;
      expect(rebuilt.pages).toEqual([
        [
          { id: 1, commentsShown: false },
          { id: 2, commentsShown: false },
        ],
        [
          { id: 4, commentsShown: false },
        ],
      ]);
      expect(rebuilt.pageParams).toEqual([undefined, 2]);
    });

    it('handles undefined/falsy page entries in oldData', () => {
      const oldData = { pages: [undefined, [{ id: 5, commentsShown: false }]] as any, pageParams: [] };
      const rebuilt = rebuildAfterRemoval(oldData as any, 999, 10)!;
      expect(rebuilt.pages).toEqual([[{ id: 5, commentsShown: false }]]);
      expect(rebuilt.pageParams).toEqual([undefined]);
    });
  });
});
