const API_BASE = '/api';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('docmirror_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('docmirror_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

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
    const token = localStorage.getItem('docmirror_token');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/uploads/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
