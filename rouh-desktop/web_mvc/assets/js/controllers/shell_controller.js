function renderShell() {
  byId("profile-avatar").innerHTML = avatarHtml(state.user, "small");
  byId("profile-name").textContent = state.user.name;
  byId("profile-role").textContent = state.user.title;
  const menu = menus[state.user.role];
  byId("side-nav").innerHTML = menu.map((page, index) => `
    <button class="nav-item ${page === state.page ? "active" : ""}" data-page="${page}" data-index="${String(index + 1).padStart(2, "0")}">
      <span class="nav-icon">${icons[page]}</span><span>${titles[page]}</span>
    </button>
  `).join("");
  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => {
    state.page = button.dataset.page;
    renderShell();
  }));
  byId("screen-number").textContent = String(menu.indexOf(state.page) + 1).padStart(2, "0");
  byId("page-title").textContent = titles[state.page] || "ROUH";
  byId("page-subtitle").textContent = `Bienvenue, ${state.user.name} | ${roleLabels[state.user.role]}`;
  byId("page-content").innerHTML = renderPage();
  bindPageActions();
  if (state.user.role === "emergency") notifyEmergency();
}

function renderPage() {
  const role = state.user.role;
  if (state.page === "dashboard") return dashboardPage(role);
  if (state.page === "requests") return role === "doctor" ? doctorRequestsPage() : registrationRequestsPage();
  if (state.page === "users") return usersPage();
  if (state.page === "appointments") return patientAppointmentsPage();
  if (state.page === "medications") return patientMedicationsPage();
  if (state.page === "homecare") return patientHomecarePage();
  if (state.page === "records") return recordsPage(role);
  if (state.page === "sos") return sosPage();
  if (state.page === "smartwatch") return smartwatchPage();
  if (state.page === "messages") return messagesPage();
  if (state.page === "profile") return profilePage();
  if (state.page === "teleconsultations") return teleconsultationsPage();
  if (state.page === "schedule") return schedulePage();
  if (state.page === "prescriptions") return prescriptionsPage(role);
  if (state.page === "history") return historyPage(role);
  if (state.page === "tasks") return nurseTasksPage();
  if (state.page === "patients") return nursePatientsPage();
  if (state.page === "alerts") return emergencyAlertsPage();
  if (state.page === "interventions") return interventionsPage();
  return dashboardPage(role);
}

