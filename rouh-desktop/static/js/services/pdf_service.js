function downloadPrescriptionPdf() {
  const patient = document.querySelector("[data-form='prescription'] [name='patient']")?.value || "Patient";
  const medicine = document.querySelector("[data-form='prescription'] [name='medicine']")?.value || "Medicament";
  const dosage = document.querySelector("[data-form='prescription'] [name='dosage']")?.value || "";
  const instructions = document.querySelector("[data-form='prescription'] [name='instructions']")?.value || "";
  const content = prescriptionPdfContent({ patient, doctor: state.user?.name || "Medecin", medicine, dosage, instructions, date: new Date().toLocaleDateString("fr-FR") });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "application/pdf" }));
  link.download = `ordonnance_${Date.now()}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast("PDF telecharge.");
}

function openPrescriptionPdf(row) {
  if (!row) return toast("Ordonnance introuvable.");
  revokeActivePdf();
  const prescription = prescriptionForOrder(row);
  state.activePdfUrl = URL.createObjectURL(new Blob([prescriptionPdfContent(prescription)], { type: "application/pdf" }));
  const title = `Ordonnance - ${prescription.patient || "Patient"}`;
  const content = `
    <div class="pdf-preview">
      <div class="detail-grid">
        <strong>Patient</strong><span>${escapeHtml(prescription.patient || "-")}</span>
        <strong>Medecin</strong><span>${escapeHtml(prescription.doctor || "-")}</span>
        <strong>Document</strong><span>${escapeHtml(prescription.document || "ordonnance.pdf")}</span>
        <strong>Statut</strong><span>${escapeHtml(row.status || "-")}</span>
      </div>
      <iframe src="${state.activePdfUrl}" title="${escapeHtml(title)}"></iframe>
      <div class="pdf-actions"><a class="secondary" href="${state.activePdfUrl}" target="_blank" rel="noopener">Ouvrir le PDF</a></div>
    </div>`;
  openModal(title, content, "pdf-modal");
}

function prescriptionForOrder(row) {
  const match = state.db.prescriptions.find((item) =>
    item.id === row.id || item.document === row.document || (item.patient === row.patient && item.doctor === row.doctor)
  );
  return {
    patient: row.patient || match?.patient || "Patient",
    doctor: row.doctor || match?.doctor || "Medecin",
    document: row.document || match?.document || `${row.id || "ordonnance"}.pdf`,
    medicine: match?.medicine || "Medicaments prescrits",
    dosage: match?.dosage || match?.total || "",
    instructions: match?.instructions || "Voir la prescription medicale et preparer la commande selon disponibilite.",
    date: row.date || match?.date || new Date().toLocaleDateString("fr-FR"),
  };
}

function prescriptionPdfContent({ patient, doctor, medicine, dosage, instructions, date }) {
  const stream = [
    "BT",
    "/F1 18 Tf 72 760 Td (ROUH - Ordonnance) Tj",
    `/F1 12 Tf 0 -35 Td (Patient: ${pdfText(patient)}) Tj`,
    `0 -24 Td (Medecin: ${pdfText(doctor)}) Tj`,
    `0 -24 Td (Date: ${pdfText(date)}) Tj`,
    `0 -32 Td (Medicament: ${pdfText(medicine)} ${pdfText(dosage)}) Tj`,
    `0 -24 Td (Prescription: ${pdfText(instructions)}) Tj`,
    "ET",
  ].join("\n");
  const objects = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Count 1/Kids[3 0 R]>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>",
    `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`,
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function pdfText(value) {
  return String(value).replace(/[()\\]/g, " ");
}

function revokeActivePdf() {
  if (!state.activePdfUrl) return;
  URL.revokeObjectURL(state.activePdfUrl);
  state.activePdfUrl = "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

