CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  prenom VARCHAR(120) DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(40) DEFAULT '',
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'patient',
  date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(40) NOT NULL DEFAULT 'Actif',
  title VARCHAR(160) DEFAULT '',
  specialty VARCHAR(160) DEFAULT '',
  city VARCHAR(120) DEFAULT 'Casablanca',
  photo_url TEXT DEFAULT '',
  reset_token_hash VARCHAR(255) DEFAULT '',
  reset_token_expires_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_telephone ON users(telephone);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  doctor_id INTEGER REFERENCES users(id),
  patient_name VARCHAR(180) DEFAULT '',
  doctor_name VARCHAR(180) DEFAULT '',
  scheduled_for VARCHAR(120) DEFAULT '',
  type VARCHAR(60) DEFAULT 'Cabinet',
  reason TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'En attente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  doctor_id INTEGER REFERENCES users(id),
  patient_name VARCHAR(180) DEFAULT '',
  age VARCHAR(30) DEFAULT '',
  weight VARCHAR(30) DEFAULT '',
  height VARCHAR(30) DEFAULT '',
  blood VARCHAR(20) DEFAULT '',
  status VARCHAR(60) DEFAULT '',
  description TEXT DEFAULT '',
  document_title VARCHAR(255) DEFAULT '',
  source VARCHAR(80) DEFAULT 'Medecin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  doctor_id INTEGER REFERENCES users(id),
  patient_name VARCHAR(180) DEFAULT '',
  doctor_name VARCHAR(180) DEFAULT '',
  medicine VARCHAR(255) DEFAULT '',
  dosage VARCHAR(120) DEFAULT '',
  instructions TEXT DEFAULT '',
  document VARCHAR(255) DEFAULT '',
  total VARCHAR(80) DEFAULT '',
  status VARCHAR(80) DEFAULT 'Envoye pharmacie',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id SERIAL PRIMARY KEY,
  prescription_id INTEGER REFERENCES prescriptions(id),
  patient_id INTEGER REFERENCES users(id),
  pharmacy_id INTEGER REFERENCES users(id),
  patient_name VARCHAR(180) DEFAULT '',
  doctor_name VARCHAR(180) DEFAULT '',
  pharmacy_name VARCHAR(180) DEFAULT '',
  document VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  status VARCHAR(80) DEFAULT 'Recu',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  patient_name VARCHAR(180) DEFAULT '',
  type VARCHAR(120) DEFAULT 'SOS patient',
  location TEXT DEFAULT '',
  gravity VARCHAR(60) DEFAULT 'Critique',
  status VARCHAR(80) DEFAULT 'Nouveau',
  team VARCHAR(120) DEFAULT 'A assigner',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  recipient_id INTEGER REFERENCES users(id),
  sender_name VARCHAR(180) DEFAULT '',
  recipient_name VARCHAR(180) DEFAULT '',
  role_label VARCHAR(80) DEFAULT '',
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(180) NOT NULL,
  body TEXT DEFAULT '',
  type VARCHAR(80) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255) DEFAULT '',
  ip_address VARCHAR(80) DEFAULT '',
  user_agent TEXT DEFAULT '',
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id),
  actor_name VARCHAR(180) DEFAULT 'Systeme',
  event TEXT NOT NULL,
  status VARCHAR(80) DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(40) DEFAULT '',
  role VARCHAR(80) DEFAULT 'Patient',
  specialty VARCHAR(160) DEFAULT '',
  status VARCHAR(80) DEFAULT 'En attente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
