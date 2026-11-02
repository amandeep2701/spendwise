const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection or backend URL.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const getExpenses = (month) =>
  request(`/api/expenses?month=${encodeURIComponent(month)}`);

export const getSummary = (month) =>
  request(`/api/expenses/summary?month=${encodeURIComponent(month)}`);

export const createExpense = (payload) =>
  request("/api/expenses", { method: "POST", body: JSON.stringify(payload) });

export const updateExpense = (id, payload) =>
  request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteExpense = (id) =>
  request(`/api/expenses/${id}`, { method: "DELETE" });
