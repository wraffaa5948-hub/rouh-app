function bindAuth() {
  byId("login-form").addEventListener("submit", login);
  byId("open-register").addEventListener("click", () => toggleRegister(true));
  byId("open-reset").addEventListener("click", openPasswordReset);
  byId("back-login").addEventListener("click", () => toggleRegister(false));
  byId("register-form").addEventListener("submit", registerAccount);
  byId("logout-button").addEventListener("click", logout);
  clearLoginFields();
  setTimeout(clearLoginFields, 150);
  clearRegisterFields();
}

function renderRolePicker() {
  const roles = ["patient", "doctor", "nurse", "pharmacy", "emergency"];
  byId("role-picker").innerHTML = roles.map((role) => `
    <button type="button" class="role-option ${role === state.selectedRegisterRole ? "active" : ""}" data-role="${role}">
      <span class="role-icon">${roleIcon(role)}</span><b>${roleLabels[role]}</b><small>${roleText(role)}</small>
    </button>
  `).join("");
  document.querySelectorAll(".role-option").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRegisterRole = button.dataset.role;
      byId("specialty-field").classList.toggle("hidden", state.selectedRegisterRole !== "doctor");
      renderRolePicker();
    });
  });
}

async function login(event) {
  event.preventDefault();
  const id = byId("login-id").value.trim().toLowerCase();
  const password = byId("login-password").value;
  try {
    const payload = await apiJson("/api/login", "POST", { identifier: id, password });
    state.user = payload.user;
    await refreshDb();
    state.page = menus[state.user.role][0];
    byId("auth-screen").classList.add("hidden");
    byId("app-screen").classList.remove("hidden");
    renderShell();
    startAutoRefresh();
    toast(`Bienvenue ${state.user.name}.`);
  } catch (error) {
    toast(error.message);
  }
}

async function logout() {
  await apiJson("/api/logout", "POST", {});
  stopAutoRefresh();
  state.user = null;
  byId("app-screen").classList.add("hidden");
  byId("auth-screen").classList.remove("hidden");
  toggleRegister(false);
}

async function registerAccount(event) {
  event.preventDefault();
  const name = byId("reg-name").value.trim();
  const email = byId("reg-email").value.trim();
  const phone = byId("reg-phone").value.trim();
  const password = byId("reg-password").value;

  if (!name || !email || !phone || !password) {
    return toast("Veuillez remplir tous les champs.");
  }

  try {
    const payload = await apiJson("/api/register", "POST", {
      name,
      email,
      phone,
      password,
      role: state.selectedRegisterRole,
      specialty: state.selectedRegisterRole === "doctor" ? byId("reg-specialty").value.trim() : "",
    });
    await refreshDb();
    toast(payload.message || "Compte cree.");
    toggleRegister(false);
    byId("login-id").value = email;
    byId("login-password").value = "";
  } catch (error) {
    toast(error.message);
  }
}

function toggleRegister(open) {
  byId("login-panel").classList.toggle("hidden", open);
  byId("register-panel").classList.toggle("hidden", !open);
  byId("auth-title").textContent = open ? "Rejoignez la plateforme ROUH" : "Une plateforme complete pour votre sante";
  if (open) clearRegisterFields();
  if (!open) clearLoginFields();
}

function openPasswordReset() {
  const root = byId("modal-root");
  root.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" type="button" data-reset-close>&times;</button>
      <h3>Mot de passe oublie</h3>
      <form id="reset-request-form" class="stack">
        <label>Email du compte<input id="reset-email" type="email" autocomplete="email" required></label>
        <button class="primary wide" type="submit">Envoyer le code</button>
      </form>
      <form id="reset-confirm-form" class="stack hidden">
        <label>Code recu par email<input id="reset-code" type="text" inputmode="numeric" maxlength="6" required></label>
        <label>Nouveau mot de passe<input id="reset-password" type="password" autocomplete="new-password" required></label>
        <button class="primary wide" type="submit">Changer le mot de passe</button>
      </form>
    </div>
  `;
  root.classList.remove("hidden");
  root.querySelector("[data-reset-close]").addEventListener("click", closePasswordReset);
  byId("reset-request-form").addEventListener("submit", requestPasswordCode);
  byId("reset-confirm-form").addEventListener("submit", confirmPasswordReset);
}

function closePasswordReset() {
  const root = byId("modal-root");
  root.classList.add("hidden");
  root.innerHTML = "";
}

async function requestPasswordCode(event) {
  event.preventDefault();
  const email = byId("reset-email").value.trim().toLowerCase();
  if (!email) return toast("Veuillez saisir votre email.");
  try {
    const payload = await apiJson("/api/password/reset", "POST", { email });
    byId("reset-request-form").classList.add("hidden");
    byId("reset-confirm-form").classList.remove("hidden");
    toast(payload.message || "Code envoye par email.");
  } catch (error) {
    toast(error.message);
  }
}

async function confirmPasswordReset(event) {
  event.preventDefault();
  const email = byId("reset-email").value.trim().toLowerCase();
  const code = byId("reset-code").value.trim();
  const password = byId("reset-password").value;
  if (!code || !password) return toast("Veuillez saisir le code et le nouveau mot de passe.");
  try {
    const payload = await apiJson("/api/password/confirm", "POST", { email, code, password });
    closePasswordReset();
    byId("login-id").value = email;
    byId("login-password").value = "";
    toast(payload.message || "Mot de passe reinitialise.");
  } catch (error) {
    toast(error.message);
  }
}

function buildRegisteredAccount({ name, email, phone, password }) {
  const role = state.selectedRegisterRole;
  const specialty = role === "doctor" ? byId("reg-specialty").value.trim() : "";
  return {
    id: nextAccountId(role),
    role,
    role_label: roleLabels[role],
    name,
    email,
    phone,
    password,
    city: "Casablanca",
    status: "Actif",
    title: specialty || roleLabels[role],
    specialty,
    avatar: initials(name),
  };
}

function nextAccountId(role) {
  const prefixes = {
    patient: "PAT",
    doctor: "DOC",
    nurse: "NUR",
    pharmacy: "PHA",
    emergency: "URG",
  };
  return nextId(prefixes[role] || "USR", state.db.accounts);
}

function addRoleRecord(account) {
  if (account.role === "patient") {
    state.db.patients.push({
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      age: "-",
      room: "-",
      doctor: "-",
      status: "Actif",
    });
  }
  if (account.role === "doctor") {
    state.db.doctors.push({
      id: account.id,
      name: account.name,
      specialty: account.specialty || "Generaliste",
      phone: account.phone,
      status: "Actif",
      experience: "-",
      rating: "-",
    });
  }
  if (account.role === "nurse") {
    state.db.nurses.push({
      id: account.id,
      name: account.name,
      specialty: account.specialty || "Soins infirmiers",
      phone: account.phone,
      status: "Actif",
    });
  }
  if (account.role === "pharmacy") {
    state.db.pharmacies.push({
      id: account.id,
      name: account.name,
      address: "Casablanca",
      phone: account.phone,
      status: "Active",
    });
  }
}

function clearLoginFields() {
  byId("login-id").value = "";
  byId("login-password").value = "";
}

function clearRegisterFields() {
  ["reg-name", "reg-email", "reg-phone", "reg-password", "reg-specialty"].forEach((id) => {
    const field = byId(id);
    if (field) field.value = "";
  });
}
