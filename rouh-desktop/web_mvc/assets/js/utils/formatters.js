function cell(value) {
  const text = String(value ?? "");
  const lower = text.toLowerCase();
  if (["actif", "active", "confirme", "stable", "disponible", "en stock", "approuve", "accepte", "programme", "livre"].some(x => lower.includes(x))) return `<span class="badge ok">${text}</span>`;
  if (["attente", "preparation", "faible", "faire", "recu", "traitement"].some(x => lower.includes(x))) return `<span class="badge warn">${text}</span>`;
  if (["critique", "urgence", "rupture", "refuse", "annule"].some(x => lower.includes(x))) return `<span class="badge danger">${text}</span>`;
  if (text.startsWith("http")) return `<a href="${text}" target="_blank">${text}</a>`;
  return text;
}

function label(key) {
  return {
    name: "Nom", role_label: "Role", email: "Email", phone: "Telephone", status: "Statut", date: "Date", patient: "Patient",
    doctor: "Medecin", type: "Type", reason: "Motif", specialty: "Specialite", address: "Adresse", age: "Age", room: "Chambre",
    care: "Soin", nurse: "Infirmier", priority: "Priorite", gravity: "Gravite", location: "Localisation", time: "Heure",
    category: "Categorie", stock: "Stock", price: "Prix", total: "Total", role: "Role", document: "Document", meet: "Lien Meet",
    medicine: "Medicament", dosage: "Dosage", frequency: "Frequence", next: "Rappel", source: "Source", title: "Titre",
    weight: "Poids", height: "Taille", blood: "Groupe sanguin",
  }[key] || key;
}

function badgeClass(status) {
  const lower = String(status).toLowerCase();
  if (lower.includes("attente") || lower.includes("recu")) return "warn";
  if (lower.includes("refuse") || lower.includes("annule") || lower.includes("critique")) return "danger";
  return "ok";
}

function avatarHtml(person, size) {
  if (person && person.photo) return `<img class="avatar-img ${size}" src="${person.photo}" alt="">`;
  return `<span class="avatar-fallback ${size}">${initials(person?.name || person?.role_label || "?")}</span>`;
}

function initials(name) {
  return String(name).split(" ").filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("");
}

function roleIcon(role) {
  return APP_ICONS.roles[role] || APP_ICONS.roles.fallback;
}

function roleText(role) {
  return {
    patient: "Accedez a vos soins",
    doctor: "Gerez vos patients",
    nurse: "Soins a domicile",
    pharmacy: "Commandes et ordonnances",
    emergency: "Alertes et interventions",
  }[role];
}

function nextId(prefix, rows) {
  return `${prefix}-${String(rows.length + 1).padStart(3, "0")}`;
}

function byId(id) {
  return document.getElementById(id);
}

function toast(message) {
  const node = byId("toast");
  node.textContent = message;
  node.classList.add("show");
  setTimeout(() => node.classList.remove("show"), 2600);
}

