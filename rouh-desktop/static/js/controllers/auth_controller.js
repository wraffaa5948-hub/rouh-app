function bindAuth() {
  byId("login-form").addEventListener("submit", login);
  byId("open-register").addEventListener("click", () => toggleRegister(true));
  byId("back-login").addEventListener("click", () => toggleRegister(false));
  byId("register-form").addEventListener("submit", registerAccount);
  byId("logout-button").addEventListener("click", logout);
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

function login(event) {
  event.preventDefault();
  const id = byId("login-id").value.trim().toLowerCase();
  const password = byId("login-password").value;
  const user = state.db.accounts.find((account) =>
    (account.email.toLowerCase() === id || account.phone.replaceAll(" ", "") === id.replaceAll(" ", "")) &&
    account.password === password
  );
  if (!user) return toast("Identifiants incorrects.");
  state.user = user;
  state.page = menus[user.role][0];
  byId("auth-screen").classList.add("hidden");
  byId("app-screen").classList.remove("hidden");
  renderShell();
  toast(`Bienvenue ${user.name}.`);
}

function logout() {
  state.user = null;
  byId("app-screen").classList.add("hidden");
  byId("auth-screen").classList.remove("hidden");
  toggleRegister(false);
}

function registerAccount(event) {
  event.preventDefault();
  const role = roleLabels[state.selectedRegisterRole];
  state.db.registration_requests.unshift({
    id: nextId("REQ", state.db.registration_requests),
    name: byId("reg-name").value,
    role,
    email: byId("reg-email").value,
    phone: byId("reg-phone").value,
    specialty: state.selectedRegisterRole === "doctor" ? byId("reg-specialty").value : "",
    date: "Envoye maintenant",
    status: "En attente",
  });
  toast("Envoye a l'administration.");
  toggleRegister(false);
}

function toggleRegister(open) {
  byId("login-panel").classList.toggle("hidden", open);
  byId("register-panel").classList.toggle("hidden", !open);
  byId("auth-title").textContent = open ? "Rejoignez la plateforme ROUH" : "Une plateforme complete pour votre sante";
}

