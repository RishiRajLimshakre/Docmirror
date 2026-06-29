const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

import type { DocMirrorDocument, DocumentListItem } from '@/types/document';

export const documentsApi = {
  list: () => request<DocumentListItem[]>('/documents'),

  get: (id: string) => request<DocMirrorDocument>(`/documents/${id}`),

  create: (data: Partial<DocMirrorDocument>) =>
    request<DocMirrorDocument>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<DocMirrorDocument>) =>
    request<DocMirrorDocument>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  rename: (id: string, title: string) =>
    request<DocMirrorDocument>(`/documents/${id}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),

  delete: (id: string) =>
    request<void>(`/documents/${id}`, { method: 'DELETE' }),
};

export const uploadsApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/uploads/image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Upload failed');
    }
    return res.json() as Promise<{
      url: string;
      filename: string;
      originalName: string;
    }>;
  },
};

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
