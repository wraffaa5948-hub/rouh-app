const state = {
  db: null,
  user: null,
  page: "dashboard",
  selectedRegisterRole: "patient",
  uploadTarget: null,
  selectedRecipient: "",
  lastEmergencyCount: 0,
  activePdfUrl: "",
  autoRefreshTimer: null,
  autoRefreshBusy: false,
};

const roleLabels = {
  admin: "Administrateur",
  patient: "Patient",
  doctor: "Medecin",
  nurse: "Infirmier",
  pharmacy: "Pharmacie",
  emergency: "Urgence",
};

const menus = {
  admin: ["dashboard", "requests", "users", "messages", "history"],
  patient: ["appointments", "medications", "homecare", "records", "sos", "smartwatch", "messages", "profile"],
  doctor: ["dashboard", "requests", "teleconsultations", "schedule", "records", "prescriptions", "messages", "history", "profile"],
  nurse: ["dashboard", "tasks", "patients", "messages", "history", "profile"],
  pharmacy: ["dashboard", "prescriptions", "history", "messages", "profile"],
  emergency: ["dashboard", "alerts", "history", "messages", "profile"],
};

const titles = {
  dashboard: "Tableau de bord",
  requests: "Demandes",
  users: "Gestion des utilisateurs",
  appointments: "Mes rendez-vous",
  medications: "Mes medicaments",
  homecare: "Soins a domicile",
  records: "Dossier medical",
  sos: "SOS / Urgence",
  smartwatch: "Smartwatch",
  messages: "Messages",
  profile: "Profil",
  teleconsultations: "Teleconsultations",
  schedule: "Programmer un RDV",
  prescriptions: "Ordonnances",
  history: "Historique",
  tasks: "Soins a realiser",
  patients: "Patients",
  alerts: "Alertes d'urgence",
  interventions: "Interventions",
};

async function boot() {
  try {
    await refreshDb();
    renderRolePicker();
    bindAuth();
    if (state.db.current_user) {
      state.user = state.db.current_user;
      state.page = menus[state.user.role][0];
      byId("auth-screen").classList.add("hidden");
      byId("app-screen").classList.remove("hidden");
      renderShell();
      startAutoRefresh();
    }
  } catch (error) {
    renderRolePicker();
    bindAuth();
    toast("Connexion au serveur en cours. Rechargez la page si besoin.");
    console.error(error);
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  state.autoRefreshTimer = setInterval(autoRefreshApp, 15000);
}

function stopAutoRefresh() {
  if (!state.autoRefreshTimer) return;
  clearInterval(state.autoRefreshTimer);
  state.autoRefreshTimer = null;
}

async function autoRefreshApp() {
  if (!state.user || state.autoRefreshBusy || isUserEditing()) return;
  state.autoRefreshBusy = true;
  try {
    const previousPage = state.page;
    await refreshDb();
    state.page = previousPage;
    renderShell();
  } catch (error) {
    console.warn("Actualisation automatique interrompue", error);
  } finally {
    state.autoRefreshBusy = false;
  }
}

function isUserEditing() {
  const active = document.activeElement;
  const isInputActive = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
  const modalOpen = !byId("modal-root").classList.contains("hidden");
  return isInputActive || modalOpen;
}

function normalizeDb() {
  state.db.accounts.forEach((account) => {
    account.photo = account.photo || "";
    account.specialty = account.specialty || account.title || "";
  });
  state.db.documents = state.db.documents || [
    { id: "DOCM-1", patient: "Ahmed Benali", title: "Ordonnance - Dr Karim Benali", type: "Ordonnance", source: "Medecin", date: "20 Mai 2024", status: "Envoye" },
    { id: "DOCM-2", patient: "Ahmed Benali", title: "Analyse sanguine", type: "Analyse", source: "Patient", date: "18 Mai 2024", status: "Archive" },
  ];
  state.db.teleconsultations = state.db.teleconsultations || state.db.appointments
    .filter((item) => item.type === "Teleconsultation")
    .map((item, index) => ({ ...item, meet: `https://meet.google.com/rouh-${index + 100}` }));
  state.db.pharmacy_orders = state.db.pharmacy_orders || state.db.prescriptions.map((item) => ({
    id: item.id,
    patient: item.patient,
    doctor: item.doctor,
    document: `${item.id}.pdf`,
    date: item.date,
    status: item.status,
  }));
  state.db.care_history = state.db.care_history || [];
  state.db.medical_records = state.db.medical_records || [];
  state.db.chartSeries = state.db.chartSeries || {
    appointments: [2, 4, 3, 7, 5, 9, 7, 11, 9, 13, 11],
    consultations: [1, 3, 2, 4, 5, 6, 5, 8, 7, 9, 8],
    care: [3, 5, 4, 6, 9, 8, 10],
    emergencies: [1, 0, 2, 1, 3, 2, 4],
    pharmacy: [5, 9, 14, 10, 13, 8, 15],
  };
  state.db.history = state.db.history || [];
  state.db.selectedPharmacy = state.db.pharmacies[0]?.name || "";
  state.db.selectedNurse = state.db.nurses[0]?.name || "";
  if (!state.db.messages.length) {
    state.selectedRecipient = state.db.accounts.find((account) => account.role === "doctor")?.name || "";
  }
}

