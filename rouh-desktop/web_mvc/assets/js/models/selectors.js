function rowFor(type, index) {
  const maps = {
    request: state.db.registration_requests,
    user: state.db.accounts,
    appointmentDoctor: doctorAppointments(),
    appointmentHistory: doctorAppointments(),
    appointmentPatient: patientAppointments(),
    careNurse: nurseCare(),
    carePatient: patientCare(),
    nursePatient: state.db.patients,
    medicalRecord: state.db.medical_records,
    pharmacyOrder: pharmacyOrders(),
    prescriptionDoctor: doctorPrescriptions(),
    alert: emergencyAlerts(),
    document: patientDocuments(),
    medication: patientMedications(),
  };
  return (maps[type] || [])[index];
}

function doctorAppointments() {
  return state.db.appointments.filter(a => a.doctor === state.user.name || state.user.role !== "doctor");
}

function patientAppointments() {
  return state.db.appointments.filter(a => a.patient === state.user.name);
}

function patientMedications() {
  return state.db.medications.filter(m => m.patient === state.user.name);
}

function patientCare() {
  return state.db.home_care.filter(c => c.patient === state.user.name);
}

function nurseCare() {
  return state.db.home_care.filter(c => c.nurse === state.user.name || state.user.role !== "nurse");
}

function patientDocuments() {
  return state.db.documents.filter(d => d.patient === state.user.name || state.user.role !== "patient");
}

function patientEmergencies() {
  return state.db.emergencies.filter(e => e.patient === state.user.name);
}

function emergencyAlerts() {
  return state.db.emergencies;
}

function pharmacyOrders() {
  return state.db.pharmacy_orders;
}

function doctorPrescriptions() {
  return state.db.prescriptions.filter(p => p.doctor === state.user.name || state.user.role !== "doctor");
}

function inbox() {
  return state.db.messages.filter(m =>
    (m.to === state.user.name && m.from === state.selectedRecipient) ||
    (m.from === state.user.name && m.to === state.selectedRecipient)
  );
}

function conversationHtml() {
  const items = inbox().slice().reverse();
  return items.map(m => `<div class="bubble ${m.from === state.user.name ? "me" : ""}"><span>${m.body}</span><small>${m.time}</small></div>`).join("") || "<div class='empty-chat'>Aucun message. Choisissez un destinataire et envoyez le premier message.</div>";
}

function roleBreakdown() {
  return countBy(state.db.accounts, "role_label");
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "Autres";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function usersByRole(role) {
  return state.db.accounts.filter(a => a.role === role);
}

function unique(items) {
  return [...new Set(items)];
}

function findDoctor(name) {
  return state.db.doctors.find(d => d.name === name) || { name, avatar: initials(name) };
}

