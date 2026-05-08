function bindAuth() {
  byId("login-form").addEventListener("submit", login);
  byId("open-register").addEventListener("click", () => toggleRegister(true));
  byId("back-login").addEventListener("click", () => toggleRegister(false));
  byId("register-form").addEventListener("submit", registerAccount);
  byId("logout-button").addEventListener("click", logout);
  clearLoginFields();
  setTimeout(clearLoginFields, 150);
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
    toast(`Bienvenue ${state.user.name}.`);
  } catch (error) {
    toast(error.message);
  }
}

async function logout() {
  await apiJson("/api/logout", "POST", {});
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
  if (!open) clearLoginFields();
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
