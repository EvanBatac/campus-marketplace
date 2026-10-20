const API_URL = import.meta.env.VITE_API_URL;
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");

  const isFormData = body instanceof FormData;

  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data;
}
