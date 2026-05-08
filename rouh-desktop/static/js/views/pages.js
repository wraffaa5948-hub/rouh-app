function dashboardPage(role) {
  if (role === "admin") {
    return `
      ${kpis([["Utilisateurs", state.db.accounts.length], ["Medecins", state.db.doctors.length], ["Infirmiers", state.db.nurses.length], ["Pharmacies", state.db.pharmacies.length], ["Urgences", state.db.emergencies.length]])}
      <div class="grid-2 dashboard-charts">
        <section class="panel"><h3>Apercu des activites</h3>${lineChart([{ name: "RDV", values: state.db.chartSeries.appointments }, { name: "Consultations", values: state.db.chartSeries.consultations }])}</section>
        <section class="panel"><h3>Repartition des utilisateurs</h3>${donutChart(roleBreakdown())}</section>
      </div>
      <div class="grid-2">
        <section class="panel"><h3>Activite en temps reel</h3>${activityList(state.db.activities)}</section>
        <section class="panel"><h3>Historique recent</h3>${activityRows((state.db.history || []).slice(0, 5).map(h => `${h.date} - ${h.actor} - ${h.event}`))}</section>
      </div>
      ${registrationRequestsPage()}
    `;
  }
  if (role === "doctor") {
    return `
      ${kpis([["RDV aujourd'hui", doctorAppointments().length], ["Demandes en attente", doctorAppointments().filter(a => a.status === "En attente").length], ["Teleconsultations", state.db.teleconsultations.length], ["Patients suivis", state.db.patients.length]])}
      <div class="grid-2">
        <section class="panel"><h3>Agenda du jour</h3>${activityRows(doctorAppointments().map(a => `${a.date} - ${a.patient} - ${a.status}`))}</section>
        <section class="panel"><h3>Activite de la semaine</h3>${lineChart([{ name: "Rendez-vous", values: state.db.chartSeries.appointments }, { name: "Teleconsultations", values: state.db.chartSeries.consultations }])}</section>
      </div>
    `;
  }
  if (role === "nurse") {
    return `
      ${kpis([["Soins a realiser", nurseCare().filter(c => c.status !== "Realise").length], ["Patients suivis", unique(nurseCare().map(c => c.patient)).length], ["Demandes en cours", nurseCare().filter(c => c.status === "En cours").length], ["Messages", inbox().length]])}
      <div class="grid-2">
        <section class="panel"><h3>Planning du jour</h3>${activityRows(nurseCare().map(c => `${c.date} - ${c.patient} - ${c.care}`))}</section>
        <section class="panel"><h3>Repartition des soins</h3>${donutChart(countBy(nurseCare(), "care"))}</section>
      </div>
    `;
  }
  if (role === "pharmacy") {
    return `
      ${kpis([["Ordonnances recues", state.db.pharmacy_orders.length], ["A traiter", pharmacyOrders().filter(o => o.status === "A traiter").length], ["En preparation", pharmacyOrders().filter(o => o.status === "En preparation").length], ["Livrees", pharmacyOrders().filter(o => o.status === "Livre").length]])}
      <div class="grid-2">
        <section class="panel"><h3>Flux des commandes</h3>${barChart(countBy(pharmacyOrders(), "status"))}</section>
        <section class="panel"><h3>Ordonnances recentes</h3>${activityRows(pharmacyOrders().map(o => `${o.date} - ${o.patient} - ${o.status}`))}</section>
      </div>
    `;
  }
  if (role === "emergency") {
    return `
      ${kpis([["Alertes actives", emergencyAlerts().filter(e => e.status !== "Termine").length], ["Critiques", emergencyAlerts().filter(e => e.gravity === "Critique").length], ["En cours", emergencyAlerts().filter(e => e.status === "En cours").length], ["Terminees", emergencyAlerts().filter(e => e.status === "Termine").length]])}
      <div class="grid-2">
        <section class="panel emergency-panel"><h3>Alertes recentes</h3>${activityRows(emergencyAlerts().map(e => `${e.time} - ${e.type} - ${e.location}`), "red")}</section>
        <section class="panel"><h3>Interventions par statut</h3>${barChart(countBy(emergencyAlerts(), "status"))}</section>
      </div>
    `;
  }
  return "";
}

function registrationRequestsPage() {
  return tablePanel("Demandes d'inscription en attente", state.db.registration_requests, ["name", "role", "email", "specialty", "date", "status"], "request");
}

function usersPage() {
  return `
    ${kpis([["Total utilisateurs", state.db.accounts.length], ["Patients", usersByRole("patient").length], ["Medecins", usersByRole("doctor").length], ["Infirmiers", usersByRole("nurse").length], ["Pharmacies", usersByRole("pharmacy").length]])}
    ${tablePanel("Tous les utilisateurs", state.db.accounts, ["name", "role_label", "email", "phone", "status"], "user")}
  `;
}

function doctorRequestsPage() {
  return tablePanel("Demandes de rendez-vous recues", doctorAppointments(), ["patient", "date", "type", "reason", "status"], "appointmentDoctor");
}

function patientAppointmentsPage() {
  return `
    <div class="grid-3 catalog-layout">
      <section class="panel"><h3>Catalogue des medecins</h3>${doctorCatalog()}</section>
      <section class="panel"><h3>Prise de rendez-vous</h3>${appointmentForm()}</section>
      <section class="panel"><h3>Mes rendez-vous</h3>${appointmentCards(patientAppointments())}</section>
    </div>
  `;
}

function patientMedicationsPage() {
  return `
    <div class="grid-2">
      <section class="panel"><h3>Catalogue des pharmacies</h3>${pharmacyCatalog()}${medicineOrderForm()}</section>
      <section class="panel"><h3>Rappels du jour</h3>${reminderForm()}${activityRows(patientMedications().map(m => `${m.next} - ${m.name} ${m.dosage} - ${m.frequency}`))}</section>
    </div>
    ${tablePanel("Mes medicaments", patientMedications(), ["name", "dosage", "frequency", "next"], "medication")}
  `;
}

function patientHomecarePage() {
  return `
    <div class="grid-2">
      <section class="panel"><h3>Catalogue des infirmiers</h3>${nurseCatalog()}</section>
      <section class="panel"><h3>Nouvelle demande de soin</h3>${careForm()}</section>
    </div>
    ${tablePanel("Mes demandes de soins", patientCare(), ["nurse", "care", "date", "priority", "status"], "carePatient")}
  `;
}

function recordsPage(role) {
  if (role === "doctor") {
    return `
      <section class="panel"><h3>Dossier medical - envoyer au patient</h3>${medicalRecordForm()}</section>
      ${tablePanel("Dossiers archives", state.db.medical_records, ["patient", "age", "weight", "height", "blood", "status"], "medicalRecord")}
    `;
  }
  return `
    <section class="panel"><h3>Nouveau document / symptomes</h3>${patientDocumentForm()}</section>
    ${tablePanel("Documents recus du medecin", patientDocuments().filter(d => d.source === "Medecin"), ["title", "type", "source", "date"], "document")}
    ${tablePanel("Historique du dossier medical", patientDocuments(), ["title", "type", "source", "date"], "document")}
  `;
}

function sosPage() {
  return `
    <div class="grid-2">
      <section class="panel"><h3>Localisation actuelle</h3><div id="location-box" class="location-box">Position en attente...</div><button class="secondary" data-action="locate">Utiliser ma position actuelle</button><label>Symptomes<textarea id="sos-text">Douleur thoracique et vertiges</textarea></label><button class="danger wide" data-action="sos">Declencher le SOS</button></section>
      <section class="panel emergency-panel"><h3>Historique SOS</h3>${activityRows(patientEmergencies().map(e => `${e.time} - ${e.type} - ${e.status}`), "red")}</section>
    </div>
  `;
}

function smartwatchPage() {
  return `
    <div class="grid-2">
      <section class="panel profile-card"><div class="big-avatar">BT</div><h3>Montre Bluetooth</h3><span id="watch-status" class="badge warn">Non connectee</span><button class="secondary" data-action="connectWatch">Connecter en Bluetooth</button><button class="primary" data-action="syncWatch">Synchroniser</button></section>
      <section class="panel"><h3>Donnees synchronisees</h3><div id="watch-data">${activityRows(["Aucune synchronisation recente"])}</div></section>
    </div>
  `;
}

function messagesPage() {
  const recipients = state.db.accounts.filter((account) => account.id !== state.user.id);
  if (!state.selectedRecipient && recipients[0]) state.selectedRecipient = recipients[0].name;
  return `
    <div class="split">
      <section class="panel"><h3>Destinataire</h3><div class="message-list">${recipients.map(r => `<button class="message-item ${state.selectedRecipient === r.name ? "active" : ""}" data-action="selectRecipient" data-name="${r.name}"><strong>${r.name}</strong><small>${r.role_label}</small></button>`).join("")}</div></section>
      <section class="panel chat"><h3>${state.selectedRecipient || "Conversation"}</h3><input id="message-to" type="hidden" value="${state.selectedRecipient}"><div id="conversation" class="conversation-window">${conversationHtml()}</div><textarea id="message-body" placeholder="Ecrire un message..."></textarea><button class="primary" data-action="sendMessage">Envoyer</button></section>
    </div>
  `;
}

function profilePage() {
  const u = state.user;
  return `
    <div class="grid-2">
      <section class="panel profile-card"><div class="big-avatar">${avatarHtml(u, "big")}</div><h3>${u.name}</h3><p>${u.title}</p><input id="photo-input" type="file" accept="image/*" class="hidden"><button class="secondary" data-action="photo">Importer une photo</button></section>
      <section class="panel"><h3>Informations personnelles</h3>${formRows([["profile-name-input", "Nom complet", u.name], ["profile-email-input", "Email", u.email], ["profile-phone-input", "Telephone", u.phone], ["profile-title-input", "Titre", u.title]])}<button class="primary wide" data-action="saveProfile">Enregistrer les modifications</button></section>
    </div>
  `;
}

function teleconsultationsPage() {
  return `${tablePanel("Programme de teleconsultations", state.db.teleconsultations, ["patient", "date", "reason", "status", "meet"], "teleconsultation")}<section class="panel"><h3>Generer un lien Google Meet</h3>${meetForm()}</section>`;
}

function schedulePage() {
  return `<section class="panel"><h3>Programmer un rendez-vous</h3>${doctorScheduleForm()}</section>${tablePanel("Agenda", doctorAppointments(), ["patient", "date", "type", "reason", "status"], "appointmentDoctor")}`;
}

function prescriptionsPage(role) {
  if (role === "doctor") {
    return `<section class="panel"><h3>Creer une ordonnance</h3>${prescriptionForm()}</section>${tablePanel("Ordonnances envoyees", doctorPrescriptions(), ["patient", "date", "status", "document"], "prescriptionDoctor")}`;
  }
  return tablePanel("Ordonnances recues", pharmacyOrders(), ["patient", "doctor", "document", "date", "status"], "pharmacyOrder");
}

function historyPage(role) {
  if (role === "admin") return tablePanel("Historique global de l'application", state.db.history, ["date", "actor", "event", "status"], "none");
  if (role === "doctor") return tablePanel("Historique des rendez-vous", doctorAppointments(), ["patient", "date", "type", "reason", "status"], "appointmentHistory");
  if (role === "nurse") return tablePanel("Historique des demandes de soins", nurseCare(), ["patient", "care", "date", "priority", "status"], "careNurse");
  if (role === "pharmacy") return tablePanel("Historique commandes et ventes", pharmacyOrders().filter(o => ["Livre", "Annule", "Refuse"].includes(o.status)), ["patient", "doctor", "document", "date", "status"], "none");
  if (role === "emergency") return tablePanel("Historique des interventions", emergencyAlerts(), ["patient", "type", "location", "gravity", "status"], "none");
  return tablePanel("Historique", state.db.activities, ["title", "type", "time"], "none");
}

function nurseTasksPage() {
  return tablePanel("Demandes de soins a traiter", nurseCare(), ["patient", "care", "date", "priority", "status"], "careNurse");
}

function nursePatientsPage() {
  return tablePanel("Patients suivis", state.db.patients, ["name", "age", "room", "doctor", "status"], "nursePatient");
}

function emergencyAlertsPage() {
  return tablePanel("Alertes d'urgence", emergencyAlerts(), ["time", "patient", "type", "location", "gravity", "status"], "alert");
}

function interventionsPage() {
  return tablePanel("Interventions en cours", emergencyAlerts().filter(e => e.status !== "Termine"), ["id", "type", "location", "team", "status"], "alert");
}

