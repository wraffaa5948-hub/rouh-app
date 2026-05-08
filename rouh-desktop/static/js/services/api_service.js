async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Erreur serveur.");
  }
  return payload;
}

async function apiJson(url, method, body) {
  return apiRequest(url, { method, body: JSON.stringify(body || {}) });
}

async function refreshDb() {
  const payload = await apiRequest("/api/bootstrap");
  state.db = payload;
  if (payload.current_user) {
    state.user = payload.current_user;
  }
  normalizeDb();
}
