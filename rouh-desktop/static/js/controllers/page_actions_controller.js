function bindPageActions() {
  document.querySelectorAll("[data-action='add']").forEach(button => button.addEventListener("click", () => openAddModal(button.dataset.kind)));
  document.querySelectorAll("[data-action='view']").forEach(button => button.addEventListener("click", () => openViewModal(button.dataset.type, Number(button.dataset.index))));
  document.querySelectorAll("[data-action='edit']").forEach(button => button.addEventListener("click", () => openEditModal(button.dataset.type, Number(button.dataset.index))));
  document.querySelectorAll("[data-action='approve']").forEach(button => button.addEventListener("click", () => updateRequest(Number(button.dataset.index), "Approuve")));
  document.querySelectorAll("[data-action='reject']").forEach(button => button.addEventListener("click", () => updateRequest(Number(button.dataset.index), "Refuse")));
  document.querySelectorAll("[data-action='acceptAppointment']").forEach(button => button.addEventListener("click", () => updateAppointment(Number(button.dataset.index), { status: "Accepte" })));
  document.querySelectorAll("[data-action='rejectAppointment']").forEach(button => button.addEventListener("click", () => updateAppointment(Number(button.dataset.index), { status: "Refuse" })));
  document.querySelectorAll("[data-action='cancelAppointment']").forEach(button => button.addEventListener("click", () => { patientAppointments()[Number(button.dataset.index)].status = "Annule"; toast("Envoye: rendez-vous annule."); renderShell(); }));
  document.querySelectorAll("[data-action='dispatch']").forEach(button => button.addEventListener("click", () => { emergencyAlerts()[Number(button.dataset.index)].status = "Envoye a l'equipe"; toast("Envoye a l'equipe."); renderShell(); }));
  document.querySelectorAll("[data-action='pickDoctor']").forEach(button => button.addEventListener("click", () => { const select = document.querySelector("[data-form='appointment'] select[name='doctor']"); if (select) select.value = button.dataset.name; toast("Medecin choisi."); }));
  document.querySelectorAll("[data-action='pickPharmacy']").forEach(button => button.addEventListener("click", () => { state.db.selectedPharmacy = button.dataset.name; const input = byId("selected-pharmacy"); if (input) input.value = button.dataset.name; toast("Pharmacie selectionnee."); }));
  document.querySelectorAll("[data-action='pickNurse']").forEach(button => button.addEventListener("click", () => { state.db.selectedNurse = button.dataset.name; const input = byId("selected-nurse"); if (input) input.value = button.dataset.name; toast("Infirmier selectionne."); }));
  document.querySelectorAll("[data-action='selectRecipient']").forEach(button => button.addEventListener("click", () => { state.selectedRecipient = button.dataset.name; renderShell(); }));
  document.querySelectorAll("[data-action='archiveUser']").forEach(button => button.addEventListener("click", () => { state.db.accounts[Number(button.dataset.index)].status = "Archive"; addHistory("Admin Rouh", "Utilisateur archive", "Archive"); toast("Utilisateur archive."); renderShell(); }));
  document.querySelectorAll("[data-action='deleteUser']").forEach(button => button.addEventListener("click", () => { state.db.accounts.splice(Number(button.dataset.index), 1); addHistory("Admin Rouh", "Utilisateur supprime", "Archive"); toast("Utilisateur supprime."); renderShell(); }));
  bindForms();
}

function bindForms() {
  bindSubmit("appointment", (data) => {
    state.db.appointments.unshift({ id: nextId("RDV", state.db.appointments), patient: state.user.name, doctor: data.get("doctor"), date: `${data.get("date")} - ${data.get("time")}`, type: data.get("teleconsultation") ? "Teleconsultation" : "Cabinet", reason: data.get("reason"), status: "En attente" });
    toast("Envoye: rendez-vous demande au medecin.");
  });
  bindSubmit("medicineOrder", (data) => {
    const file = data.get("document");
    state.db.pharmacy_orders.unshift({ id: nextId("ORD", state.db.pharmacy_orders), patient: state.user.name, pharmacy: data.get("pharmacy"), doctor: "-", document: file && file.name ? file.name : "ordonnance_importee.pdf", notes: data.get("notes"), date: "Envoye maintenant", status: "Recu" });
    addHistory(state.user.name, `Commande envoyee a ${data.get("pharmacy")}`, "Recu");
    toast("Envoye: commande transmise a la pharmacie.");
  });
  bindSubmit("reminder", (data) => {
    state.db.medications.unshift({ id: nextId("MED", state.db.medications), patient: state.user.name, name: data.get("name"), dosage: data.get("dosage"), frequency: data.get("frequency"), next: data.get("next"), status: "" });
    toast("Rappel ajoute.");
  });
  bindSubmit("care", (data) => {
    state.db.home_care.unshift({ id: nextId("CARE", state.db.home_care), patient: state.user.name, nurse: data.get("nurse"), care: data.get("care"), date: data.get("date"), priority: "Normale", status: "En attente" });
    addHistory(state.user.name, `Demande de soin envoyee a ${data.get("nurse")}`, "En attente");
    toast("Envoye: demande de soin transmise.");
  });
  bindSubmit("document", (data) => {
    const file = data.get("file");
    state.db.documents.unshift({ id: nextId("DOCM", state.db.documents), patient: state.user.name, title: file && file.name ? file.name : "Symptomes patient", type: file && file.name ? "Import" : "Symptomes", source: "Patient", date: "Envoye maintenant", status: "Archive" });
    toast("Envoye: document archive dans le dossier medical.");
  });
  bindSubmit("medicalRecord", (data) => {
    const row = { id: nextId("REC", state.db.medical_records), patient: data.get("patient"), age: data.get("age"), weight: data.get("weight"), height: data.get("height"), blood: data.get("blood"), status: data.get("status"), description: data.get("description") };
    state.db.medical_records.unshift(row);
    state.db.documents.unshift({ id: nextId("DOCM", state.db.documents), patient: row.patient, title: `Dossier medical - ${state.user.name}`, type: "Dossier", source: "Medecin", date: "Envoye maintenant", status: "Envoye" });
    toast("Envoye: dossier transmis au patient et archive.");
  });
  bindSubmit("meet", (data) => {
    state.db.teleconsultations.unshift({ id: nextId("TEL", state.db.teleconsultations), patient: data.get("patient"), doctor: state.user.name, date: `${data.get("date")} - ${data.get("time")}`, type: "Teleconsultation", reason: "Session programmee", status: "Programme", meet: `https://meet.google.com/rouh-${Date.now().toString().slice(-6)}` });
    toast("Envoye: lien Google Meet genere.");
  });
  bindSubmit("doctorSchedule", (data) => {
    state.db.appointments.unshift({ id: nextId("RDV", state.db.appointments), patient: data.get("patient"), doctor: state.user.name, date: data.get("date"), type: "Cabinet", reason: data.get("reason"), status: "Programme" });
    toast("Envoye: rendez-vous programme.");
  });
  bindSubmit("prescription", (data) => {
    const doc = `ordonnance_${Date.now().toString().slice(-5)}.pdf`;
    state.db.prescriptions.unshift({ id: nextId("ORD", state.db.prescriptions), patient: data.get("patient"), doctor: state.user.name, document: doc, date: "Envoye maintenant", status: "Envoye pharmacie", medicine: data.get("medicine"), dosage: data.get("dosage"), instructions: data.get("instructions") });
    state.db.pharmacy_orders.unshift({ id: nextId("ORD", state.db.pharmacy_orders), patient: data.get("patient"), doctor: state.user.name, document: doc, date: "Envoye maintenant", status: "A traiter" });
    toast("Envoye: ordonnance enregistree et transmise a la pharmacie.");
  });
  const sos = document.querySelector("[data-action='sos']");
  if (sos) sos.addEventListener("click", () => {
    const location = byId("location-box").textContent.replace("Position actuelle: ", "");
    state.db.emergencies.unshift({ id: nextId("SOS", state.db.emergencies), patient: state.user.name, type: "SOS patient", location, gravity: "Critique", status: "Nouveau", team: "A assigner", time: "Maintenant" });
    addHistory(state.user.name, "Alerte SOS declenchee", "Nouveau");
    toast("Envoye: alerte SOS recue par le service urgence.");
    renderShell();
  });
  const locate = document.querySelector("[data-action='locate']");
  if (locate) locate.addEventListener("click", locateUser);
  const connectWatch = document.querySelector("[data-action='connectWatch']");
  if (connectWatch) connectWatch.addEventListener("click", connectBluetoothWatch);
  const syncWatch = document.querySelector("[data-action='syncWatch']");
  if (syncWatch) syncWatch.addEventListener("click", () => { byId("watch-data").innerHTML = activityRows(["Frequence cardiaque 73 bpm", "Pas 5 343", "Sommeil 7h20", "Synchronise maintenant"]); toast("Envoye: donnees smartwatch synchronisees."); });
  const send = document.querySelector("[data-action='sendMessage']");
  if (send) send.addEventListener("click", sendMessage);
  const photo = document.querySelector("[data-action='photo']");
  if (photo) photo.addEventListener("click", () => byId("photo-input").click());
  const photoInput = byId("photo-input");
  if (photoInput) photoInput.addEventListener("change", importProfilePhoto);
  const saveProfile = document.querySelector("[data-action='saveProfile']");
  if (saveProfile) saveProfile.addEventListener("click", saveProfileData);
  const pdf = document.querySelector("[data-action='downloadPdf']");
  if (pdf) pdf.addEventListener("click", downloadPrescriptionPdf);
}

function bindSubmit(name, handler) {
  const form = document.querySelector(`[data-form='${name}']`);
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handler(new FormData(form));
    renderShell();
  });
}

function openAddModal(kind) {
  if (kind === "user") {
    return openModal("Ajouter un utilisateur", `<label>Nom<input id="modal-name" value="Nouveau utilisateur"></label><label>Email<input id="modal-email" value="nouveau@rouh.ma"></label><label>Role<select id="modal-role"><option value="patient">Patient</option><option value="doctor">Medecin</option><option value="nurse">Infirmier</option><option value="pharmacy">Pharmacie</option></select></label><button class="primary wide" data-modal-save="user">Ajouter</button>`);
  }
  if (kind === "request") {
    return openModal("Ajouter une demande", `<label>Nom<input id="modal-name" value="Dr Nouveau"></label><label>Email<input id="modal-email" value="nouveau@example.com"></label><label>Role<input id="modal-role-label" value="Medecin"></label><button class="primary wide" data-modal-save="request">Ajouter</button>`);
  }
  if (kind === "nursePatient") {
    return openModal("Ajouter un patient", `<label>Nom<input id="modal-name" value="Nouveau Patient"></label><label>Age<input id="modal-age" value="40"></label><label>Etat<input id="modal-status" value="Stable"></label><button class="primary wide" data-modal-save="patient">Ajouter</button>`);
  }
}

function openViewModal(type, index) {
  const row = rowFor(type, index);
  if (type === "pharmacyOrder" || type === "prescriptionDoctor") return openPrescriptionPdf(row);
  openModal("Informations", `<div class="detail-grid">${Object.entries(row || {}).map(([key, value]) => `<strong>${label(key)}</strong><span>${value || "-"}</span>`).join("")}</div>`);
}

function openEditModal(type, index) {
  const row = rowFor(type, index);
  const statusOptions = statusOptionsFor(type);
  openModal("Modifier", `<label>Date / heure<input id="modal-date" value="${row.date || row.time || ""}"></label><label>Statut<select id="modal-status">${statusOptions.map(s => `<option ${row.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label><label>Note<textarea id="modal-note">${row.reason || row.description || row.care || ""}</textarea></label><button class="primary wide" data-modal-save="edit" data-type="${type}" data-index="${index}">Enregistrer</button>`);
}

function statusOptionsFor(type) {
  if (type === "appointmentPatient" || type === "appointmentDoctor" || type === "appointmentHistory") return ["En attente", "Accepte", "Confirme", "Programme", "Annule", "Refuse", "Passe"];
  if (type === "careNurse" || type === "carePatient" || type === "nursePatient") return ["En attente", "A faire", "En cours", "Realise", "Annule", "Refuse"];
  if (type === "pharmacyOrder") return ["Recu", "Accepte", "Refuse", "En preparation", "En cours de livraison", "Livre", "Annule"];
  if (type === "alert") return ["Nouveau", "Envoye a l'equipe", "En cours", "Termine", "Annule"];
  if (type === "user") return ["Actif", "Archive", "Suspendu"];
  return ["En attente", "Actif", "Archive"];
}

function openModal(title, content, className = "") {
  const root = byId("modal-root");
  root.classList.remove("hidden");
  root.innerHTML = `<div class="modal-card ${className}"><button class="modal-close" data-modal-close>${APP_ICONS.actions.cancel}</button><h3>${title}</h3>${content}</div>`;
  root.querySelector("[data-modal-close]").addEventListener("click", closeModal);
  root.querySelectorAll("[data-modal-save]").forEach(button => button.addEventListener("click", () => saveModal(button)));
}

function closeModal() {
  revokeActivePdf();
  byId("modal-root").classList.add("hidden");
  byId("modal-root").innerHTML = "";
}

function saveModal(button) {
  const mode = button.dataset.modalSave;
  if (mode === "user") {
    const role = byId("modal-role").value;
    state.db.accounts.push({ id: nextId("USR", state.db.accounts), role, role_label: roleLabels[role], name: byId("modal-name").value, email: byId("modal-email").value, phone: "06 00 00 00 00", password: "demo123", city: "Casablanca", status: "Actif", title: roleLabels[role], avatar: initials(byId("modal-name").value) });
    toast("Envoye: utilisateur ajoute.");
  }
  if (mode === "request") {
    state.db.registration_requests.unshift({ id: nextId("REQ", state.db.registration_requests), name: byId("modal-name").value, email: byId("modal-email").value, role: byId("modal-role-label").value, date: "Ajoute maintenant", status: "En attente" });
    toast("Envoye: demande ajoutee.");
  }
  if (mode === "patient") {
    state.db.patients.unshift({ id: nextId("PAT", state.db.patients), name: byId("modal-name").value, email: "patient@example.com", phone: "06 00 00 00 00", age: byId("modal-age").value, room: "109", doctor: "Dr Karim Benali", status: byId("modal-status").value });
    toast("Envoye: patient ajoute.");
  }
  if (mode === "edit") {
    const row = rowFor(button.dataset.type, Number(button.dataset.index));
    if (row) {
      row.status = byId("modal-status").value;
      if ("date" in row) row.date = byId("modal-date").value;
      if ("time" in row) row.time = byId("modal-date").value;
      if ("reason" in row) row.reason = byId("modal-note").value;
      if ("description" in row) row.description = byId("modal-note").value;
      addHistory(state.user.name, `Modification ${button.dataset.type}`, row.status || "Modifie");
      toast("Envoye: modification enregistree.");
    }
  }
  closeModal();
  renderShell();
}

function updateRequest(index, status) {
  state.db.registration_requests[index].status = status;
  toast(`Envoye: demande ${status.toLowerCase()}.`);
  renderShell();
}

function updateAppointment(index, patch) {
  Object.assign(doctorAppointments()[index], patch);
  addHistory(state.user.name, `Rendez-vous ${patch.status}`, patch.status);
  toast(`Envoye: rendez-vous ${patch.status.toLowerCase()}.`);
  renderShell();
}

function addHistory(actor, event, status) {
  state.db.history = state.db.history || [];
  state.db.history.unshift({ date: new Date().toLocaleString("fr-FR"), actor, event, status });
}

function notifyEmergency() {
  const active = emergencyAlerts().filter(e => e.status === "Nouveau").length;
  if (active <= state.lastEmergencyCount) return;
  state.lastEmergencyCount = active;
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    setTimeout(() => { oscillator.stop(); audio.close(); }, 420);
  } catch (error) {
    // Audio can be blocked until the first user interaction.
  }
}

function locateUser() {
  const fallback = () => {
    byId("location-box").textContent = "Position actuelle: Casablanca, Maroc";
    toast("Localisation detectee.");
  };
  if (!navigator.geolocation) return fallback();
  navigator.geolocation.getCurrentPosition(
    (position) => {
      byId("location-box").textContent = `Position actuelle: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      toast("Localisation detectee.");
    },
    fallback,
    { timeout: 3000 }
  );
}

async function connectBluetoothWatch() {
  if (!navigator.bluetooth) {
    byId("watch-status").textContent = "Bluetooth non disponible";
    byId("watch-status").className = "badge warn";
    toast("Bluetooth Web non disponible dans ce navigateur.");
    return;
  }
  try {
    const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ["battery_service"] });
    byId("watch-status").textContent = `Connectee: ${device.name || "Montre"}`;
    byId("watch-status").className = "badge ok";
    toast("Montre connectee en Bluetooth.");
  } catch (error) {
    toast("Connexion Bluetooth annulee.");
  }
}

function sendMessage() {
  const to = byId("message-to").value;
  const body = byId("message-body").value.trim();
  if (!body) return toast("Message vide.");
  state.db.messages.unshift({ id: nextId("MSG", state.db.messages), from: state.user.name, to, role: state.user.role_label, body, time: "Envoye maintenant" });
  byId("message-body").value = "";
  toast("Envoye: message recu par le destinataire.");
  renderShell();
}

function importProfilePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.user.photo = reader.result;
    toast("Photo importee.");
    renderShell();
  };
  reader.readAsDataURL(file);
}

function saveProfileData() {
  state.user.name = byId("profile-name-input").value;
  state.user.email = byId("profile-email-input").value;
  state.user.phone = byId("profile-phone-input").value;
  state.user.title = byId("profile-title-input").value;
  state.user.avatar = initials(state.user.name);
  toast("Envoye: profil modifie.");
  renderShell();
}

