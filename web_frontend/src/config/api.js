export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://proti-binimoy-production.up.railway.app";

const getStoredAuthToken = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem('authToken');
};

const buildHeaders = (headers = {}, body) => {
  const nextHeaders = { ...headers };
  const token = getStoredAuthToken();

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  const hasContentType = Object.keys(nextHeaders).some(
    (key) => key.toLowerCase() === 'content-type'
  );

  if (body != null && !(body instanceof FormData) && !hasContentType) {
    nextHeaders['Content-Type'] = 'application/json';
  }

  return nextHeaders;
};

export const apiFetch = (path, options = {}) => {
  const fullPath = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  return fetch(fullPath, {
    ...options,
    headers: buildHeaders(options.headers, options.body),
  });
};

export const apiJson = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  const data = await response.json().catch(() => ({}));
  return { response, data };
};
