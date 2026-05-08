function tablePanel(title, rows, columns, actionType = "view") {
  const canAdd = ["request", "user", "nursePatient"].includes(actionType);
  const actionHead = actionType === "none" ? "" : "<th>Actions</th>";
  return `<section class="panel"><div class="panel-head"><h3>${title}</h3>${canAdd ? `<button class="primary" data-action="add" data-kind="${actionType}">Ajouter</button>` : ""}</div><div class="table-wrap"><table><thead><tr>${columns.map(c => `<th>${label(c)}</th>`).join("")}${actionHead}</tr></thead><tbody>${rows.map((row, index) => `<tr>${columns.map(c => `<td>${cell(row[c])}</td>`).join("")}${actionType === "none" ? "" : `<td>${rowActions(actionType, index)}</td>`}</tr>`).join("")}</tbody></table></div></section>`;
}

function rowActions(type, index) {
  const editTypes = ["appointmentDoctor", "appointmentHistory", "careNurse", "carePatient", "nursePatient", "medicalRecord", "pharmacyOrder", "alert", "user", "document"];
  if (type === "user") return `<div class="actions"><button class="icon-btn" data-action="edit" data-type="${type}" data-index="${index}" title="Modifier">${APP_ICONS.actions.edit}</button><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Voir">${APP_ICONS.actions.view}</button><button class="icon-btn" data-action="archiveUser" data-index="${index}" title="Archiver">${APP_ICONS.actions.archive}</button><button class="icon-btn bad" data-action="deleteUser" data-index="${index}" title="Supprimer">${APP_ICONS.actions.cancel}</button></div>`;
  if (type === "request") return `<div class="actions"><button class="icon-btn good" data-action="approve" data-index="${index}" title="Approuver">${APP_ICONS.actions.approve}</button><button class="icon-btn bad" data-action="reject" data-index="${index}" title="Refuser">${APP_ICONS.actions.cancel}</button><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Voir">${APP_ICONS.actions.view}</button></div>`;
  if (type === "appointmentDoctor") return `<div class="actions"><button class="icon-btn good" data-action="acceptAppointment" data-index="${index}" title="Accepter">${APP_ICONS.actions.approve}</button><button class="icon-btn bad" data-action="rejectAppointment" data-index="${index}" title="Refuser">${APP_ICONS.actions.cancel}</button><button class="icon-btn" data-action="edit" data-type="${type}" data-index="${index}" title="Modifier">${APP_ICONS.actions.edit}</button><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Voir">${APP_ICONS.actions.view}</button></div>`;
  if (type === "pharmacyOrder") return `<div class="actions"><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Apercevoir">${APP_ICONS.actions.view}</button><button class="icon-btn" data-action="edit" data-type="${type}" data-index="${index}" title="Statut">${APP_ICONS.actions.edit}</button></div>`;
  if (type === "alert") return `<div class="actions"><button class="icon-btn bad" data-action="dispatch" data-index="${index}" title="Envoyer equipe">${APP_ICONS.actions.dispatch}</button><button class="icon-btn" data-action="edit" data-type="${type}" data-index="${index}" title="Modifier">${APP_ICONS.actions.edit}</button><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Voir">${APP_ICONS.actions.view}</button></div>`;
  if (editTypes.includes(type)) return `<div class="actions"><button class="icon-btn" data-action="edit" data-type="${type}" data-index="${index}" title="Modifier">${APP_ICONS.actions.edit}</button><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Voir">${APP_ICONS.actions.view}</button></div>`;
  return `<div class="actions"><button class="icon-btn" data-action="view" data-type="${type}" data-index="${index}" title="Voir">${APP_ICONS.actions.view}</button></div>`;
}

function doctorCatalog() {
  return `<div class="catalog-list">${state.db.doctors.map((doctor, index) => `<article class="person-card">${avatarHtml(doctor, "medium")}<div><strong>${doctor.name}</strong><small>${doctor.specialty}</small><span>${APP_ICONS.ratings.star} 4.${8 - (index % 3)} (${120 - index * 11})</span></div><button class="primary" data-action="pickDoctor" data-name="${doctor.name}">Prendre RDV</button></article>`).join("")}</div>`;
}

function pharmacyCatalog() {
  return `<div class="catalog-list">${state.db.pharmacies.map((pharmacy) => `<article class="person-card">${avatarHtml(pharmacy, "medium")}<div><strong>${pharmacy.name}</strong><small>${pharmacy.address}</small><span>${pharmacy.phone}</span></div><button class="secondary" data-action="pickPharmacy" data-name="${pharmacy.name}">Choisir</button></article>`).join("")}</div>`;
}

function nurseCatalog() {
  return `<div class="catalog-list">${state.db.nurses.map((nurse) => `<article class="person-card">${avatarHtml(nurse, "medium")}<div><strong>${nurse.name}</strong><small>${nurse.specialty}</small><span>${nurse.phone}</span></div><button class="secondary" data-action="pickNurse" data-name="${nurse.name}">Choisir</button></article>`).join("")}</div>`;
}

function appointmentForm() {
  return `<form class="stack" data-form="appointment"><label>Medecin<select name="doctor">${state.db.doctors.map(d => `<option>${d.name}</option>`).join("")}</select></label><label>Date<input name="date" type="date" value="2024-05-24"></label><label>Heure<input name="time" type="time" value="10:30"></label><label>Motif<input name="reason" value="Controle general"></label><label class="check-row"><input name="teleconsultation" type="checkbox"> Teleconsultation</label><button class="primary wide">Confirmer le rendez-vous</button></form>`;
}

function appointmentCards(rows) {
  return `<div class="stack">${rows.map((a, index) => `<article class="appointment-card">${avatarHtml(findDoctor(a.doctor), "medium")}<div><strong>${a.doctor}</strong><small>${a.date}</small><span class="badge ${badgeClass(a.status)}">${a.status}</span></div><div class="actions"><button class="icon-btn" data-action="edit" data-type="appointmentPatient" data-index="${index}">${APP_ICONS.actions.edit}</button><button class="icon-btn bad" data-action="cancelAppointment" data-index="${index}">${APP_ICONS.actions.cancel}</button></div></article>`).join("")}</div>`;
}

function medicineOrderForm() {
  return `<form class="stack" data-form="medicineOrder"><label>Pharmacie choisie<input id="selected-pharmacy" name="pharmacy" value="${state.db.selectedPharmacy || state.db.pharmacies[0]?.name || ""}" readonly></label><label>Ordonnance importee<input name="document" type="file"></label><label>Notes<textarea name="notes" placeholder="Notes pour la pharmacie"></textarea></label><button class="primary wide">Commander les medicaments</button></form>`;
}

function careForm() {
  return `<form class="stack" data-form="care"><label>Infirmier choisi<input id="selected-nurse" name="nurse" value="${state.db.selectedNurse || state.db.nurses[0]?.name || ""}" readonly></label><label>Soin<input name="care" value="Prise de tension"></label><label>Date<input name="date" type="date" value="2024-05-24"></label><button class="primary wide">Envoyer la demande</button></form>`;
}

function reminderForm() {
  return `<form class="quick-form reminder-form" data-form="reminder"><label>Medicament<input name="name" value="Vitamine D3"></label><label>Dosage<input name="dosage" value="1000 UI"></label><label>Frequence<input name="frequency" value="1 comprime / jour"></label><label>Rappel<input name="next" type="time" value="08:00"></label><button class="primary">Ajouter</button></form>`;
}

function patientDocumentForm() {
  return `<form class="stack" data-form="document"><label>Symptomes<textarea name="description">Douleur thoracique et vertiges</textarea></label><label>Importer dossier medical<input name="file" type="file"></label><button class="primary wide">Envoyer / archiver</button></form>`;
}

function medicalRecordForm() {
  return `<form class="quick-form" data-form="medicalRecord"><label>Patient<select name="patient">${state.db.patients.map(p => `<option>${p.name}</option>`).join("")}</select></label><label>Age<input name="age" value="34"></label><label>Poids<input name="weight" value="72 kg"></label><label>Taille<input name="height" value="175 cm"></label><label>Groupe sanguin<input name="blood" value="O-"></label><label>Etat<input name="status" value="Stable"></label><label class="wide-field">Description<textarea name="description">Hypertension arterielle suivie.</textarea></label><button class="primary">Envoyer au patient</button></form>`;
}

function meetForm() {
  return `<form class="quick-form" data-form="meet"><label>Patient<input name="patient" value="Ahmed Benali"></label><label>Date<input name="date" type="date" value="2024-05-25"></label><label>Heure<input name="time" type="time" value="11:00"></label><button class="primary">Generer Meet</button></form>`;
}

function doctorScheduleForm() {
  return `<form class="quick-form" data-form="doctorSchedule"><label>Patient<input name="patient" value="Ahmed Benali"></label><label>Creneau<input name="date" value="25 Mai 2024 - 11:00"></label><label>Motif<input name="reason" value="Controle general"></label><button class="primary">Programmer</button></form>`;
}

function prescriptionForm() {
  return `<form class="quick-form" data-form="prescription"><label>Patient<select name="patient">${state.db.patients.map(p => `<option>${p.name}</option>`).join("")}</select></label><label>Medicament<input name="medicine" value="Amlodipine"></label><label>Dosage<input name="dosage" value="5 mg"></label><label class="wide-field">Prescription<textarea name="instructions">1 comprime le matin pendant 30 jours.</textarea></label><button class="primary">Enregistrer</button><button type="button" class="secondary" data-action="downloadPdf">Telecharger PDF</button></form>`;
}

function formRows(rows) {
  return `<div class="stack">${rows.map(([id, labelText, value]) => `<label>${labelText}<input id="${id}" value="${value || ""}"></label>`).join("")}</div>`;
}

function kpis(items) {
  return `<div class="kpi-grid">${items.map(([labelText, value], index) => `<article class="kpi-card"><div class="kpi-icon">${APP_ICONS.kpis[index % APP_ICONS.kpis.length]}</div><div><small>${labelText}</small><strong>${value}</strong></div></article>`).join("")}</div>`;
}

function lineChart(series) {
  const all = series.flatMap(s => s.values);
  const max = Math.max(...all, 1);
  const labels = ["01", "05", "10", "15", "20", "25", "30"];
  const colors = ["#0067ff", "#10bfd4", "#7247f7"];
  const lines = series.map((s, i) => {
    const points = s.values.map((value, index) => {
      const x = 56 + (index * (520 / Math.max(s.values.length - 1, 1)));
      const y = 250 - ((value / max) * 190);
      return `${x},${y}`;
    }).join(" ");
    return `<polyline points="${points}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
  return `<div class="real-chart"><svg viewBox="0 0 640 300" role="img"><g class="axis"><line x1="48" y1="250" x2="610" y2="250"/><line x1="48" y1="35" x2="48" y2="250"/>${[0, .25, .5, .75, 1].map(p => `<line x1="48" y1="${250 - p * 190}" x2="610" y2="${250 - p * 190}" class="grid"/><text x="12" y="${255 - p * 190}">${Math.round(max * p)}</text>`).join("")}${labels.map((l, i) => `<text x="${55 + i * 83}" y="282">${l}</text>`).join("")}</g>${lines}</svg><div class="legend">${series.map((s, i) => `<span><b style="background:${colors[i % colors.length]}"></b>${s.name}</span>`).join("")}</div></div>`;
}

function barChart(values) {
  const entries = Object.entries(values);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return `<div class="bar-chart-real">${entries.map(([name, value]) => `<div class="bar-item"><span>${name}</span><div><i style="width:${(value / max) * 100}%"></i></div><strong>${value}</strong></div>`).join("")}</div>`;
}

function donutChart(values) {
  const entries = Object.entries(values);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  let start = 0;
  const colors = ["#0067ff", "#10bfd4", "#7247f7", "#ff9a2f", "#cbd7e8"];
  const gradient = entries.map(([, value], index) => {
    const end = start + (value / total) * 100;
    const slice = `${colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return slice;
  }).join(",");
  return `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(${gradient})"></div><div class="legend">${entries.map(([name, value], index) => `<span><b style="background:${colors[index % colors.length]}"></b>${name} ${value}</span>`).join("")}</div></div>`;
}

function activityList(items) {
  return `<div class="activity-list">${items.map(item => `<div class="activity-item"><strong>${item.title}</strong><small>${item.time}</small></div>`).join("")}</div>`;
}

function activityRows(items, tone = "") {
  return `<div class="activity-list">${items.map(item => `<div class="activity-item ${tone}"><span>${item}</span></div>`).join("")}</div>`;
}

