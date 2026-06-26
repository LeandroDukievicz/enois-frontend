import { api, buildQuery } from '../api-client';

export interface PostView {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string | null;
  type: 'INSIGHT' | 'ARTICLE' | 'QUESTION' | 'PROJECT' | 'OPPORTUNITY';
  content: string;
  tags: string[];
  mediaIds: string[];
  createdAt: string;
  counters: { reactions: number; comments: number; saves: number; shares: number };
  currentUserReaction?: string | null;
}

export interface PageResponse<T> { items: T[]; nextCursor: string | null; }

export interface CreatePostInput {
  type: PostView['type'];
  content: string;
  tags?: string[];
  mediaIds?: string[];
  mentionedUserIds?: string[];
}

export const feedApi = {
  list: (cursor?: string | null, limit = 20, tab?: string) =>
    api.get<PageResponse<PostView>>(`/feed${buildQuery({ cursor, limit, tab })}`),
  create: (data: CreatePostInput) => api.post<PostView>('/feed/posts', data),
  delete: (postId: string) => api.delete<{ postId: string; status: string }>(`/feed/posts/${postId}`),
  listSaved: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(`/feed/saved${buildQuery({ cursor, limit })}`),
};
