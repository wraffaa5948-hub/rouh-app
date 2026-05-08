// Registre unique des icones de l'application.
// Les entites HTML evitent les problemes d'encodage sur Windows.
const APP_ICONS = {
  actions: {
    approve: "&#10003;",
    archive: "A",
    cancel: "&times;",
    dispatch: "&rarr;",
    edit: "&#9998;",
    view: "&#128065;",
  },
  kpis: ["&#9638;", "&#9817;", "&#10010;", "&#8962;", "!"],
  nav: {
    dashboard: "#",
    requests: "&gt;",
    users: "@",
    appointments: "RDV",
    medications: "Rx",
    homecare: "H",
    records: "D",
    sos: "!",
    smartwatch: "BT",
    messages: "M",
    profile: "P",
    teleconsultations: "TV",
    schedule: "CAL",
    prescriptions: "PDF",
    history: "H",
    tasks: "OK",
    patients: "P",
    alerts: "!",
    interventions: "&gt;",
  },
  ratings: {
    star: "&#9733;",
  },
  roles: {
    patient: "&#9817;",
    doctor: "&#10010;",
    nurse: "&#9670;",
    pharmacy: "&#8962;",
    emergency: "!",
    fallback: "&#9679;",
  },
};

const icons = APP_ICONS.nav;

