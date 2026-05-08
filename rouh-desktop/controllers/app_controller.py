from __future__ import annotations

from secrets import token_urlsafe

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.data_model import get_fake_database
from models.db_models import (
    ActivityLog,
    Appointment,
    EmergencyAlert,
    LoginHistory,
    MedicalRecord,
    Message,
    Notification,
    PharmacyOrder,
    Prescription,
    RegistrationRequest,
    User,
)
from services.security import hash_password, verify_password
from services.serializers import (
    ROLE_LABELS,
    activity_row,
    appointment_row,
    emergency_row,
    login_row,
    medical_record_row,
    message_row,
    notification_row,
    pharmacy_order_row,
    prescription_row,
    public_user,
    request_row,
)
from services.validators import normalize_role, split_name, validate_email


class WebAppController:
    def __init__(self, db: Session):
        self.db = db
        self.seed_if_empty()

    def seed_if_empty(self) -> None:
        if self.db.query(User).first():
            return
        demo = get_fake_database()
        account_by_name: dict[str, User] = {}
        for account in demo["accounts"]:
            nom, prenom = split_name(account["name"])
            email = account["email"].lower()
            if email == "fatima.zahra@rouh.ma" and normalize_role(account["role"]) == "patient":
                email = "fatima.patient@rouh.ma"
            user = User(
                nom=nom,
                prenom=prenom,
                email=email,
                telephone=account.get("phone", ""),
                mot_de_passe_hash=hash_password(account["password"]),
                role=normalize_role(account["role"]),
                statut=account.get("status", "Actif"),
                title=account.get("title", ""),
                specialty=account.get("specialty", ""),
                city=account.get("city", "Casablanca"),
            )
            self.db.add(user)
            account_by_name[account["name"]] = user
        self.db.flush()
        for row in demo["registration_requests"]:
            self.db.add(RegistrationRequest(name=row["name"], email=row["email"], phone=row.get("phone", ""), role=row["role"], specialty=row.get("specialty", ""), status=row["status"]))
        for row in demo["appointments"]:
            self.db.add(Appointment(patient_name=row["patient"], doctor_name=row["doctor"], scheduled_for=row["date"], type=row["type"], reason=row["reason"], status=row["status"]))
        for row in demo["prescriptions"]:
            self.db.add(Prescription(patient_name=row["patient"], doctor_name=row["doctor"], total=row.get("total", ""), status=row["status"], document=row.get("document", f"{row['id']}.pdf")))
            self.db.add(PharmacyOrder(patient_name=row["patient"], doctor_name=row["doctor"], document=row.get("document", f"{row['id']}.pdf"), status=row["status"]))
        for row in demo["emergencies"]:
            self.db.add(EmergencyAlert(patient_name=row["patient"], type=row["type"], location=row["location"], gravity=row["gravity"], status=row["status"], team=row["team"]))
        for row in demo["history"]:
            self.db.add(ActivityLog(actor_name=row["actor"], event=row["event"], status=row["status"]))
        self.db.add(ActivityLog(actor_name="Systeme", event="Base PostgreSQL initialisee", status="Actif"))
        self.db.commit()

    def get_bootstrap_payload(self, current_user_id: int | None = None) -> dict[str, object]:
        demo = get_fake_database()
        users = self.db.query(User).order_by(User.id).all()
        doctors = [public_user(user) for user in users if user.role == "doctor"]
        nurses = [public_user(user) for user in users if user.role == "nurse"]
        pharmacies = [public_user(user) for user in users if user.role == "pharmacy"]
        patients = [public_user(user) for user in users if user.role == "patient"]
        current = self.db.get(User, current_user_id) if current_user_id else None
        payload = {
            **demo,
            "accounts": [public_user(user) for user in users],
            "doctors": [{**item, "name": item["name"], "phone": item["phone"], "status": item["status"], "experience": "-", "rating": "4.8"} for item in doctors],
            "nurses": [{**item, "name": item["name"], "phone": item["phone"], "status": item["status"]} for item in nurses],
            "pharmacies": [{**item, "name": item["name"], "phone": item["phone"], "address": item["city"], "status": item["status"]} for item in pharmacies],
            "patients": [{**item, "age": "-", "room": "-", "doctor": "-", "status": item["status"]} for item in patients],
            "registration_requests": [request_row(item) for item in self.db.query(RegistrationRequest).order_by(RegistrationRequest.id.desc()).all()],
            "appointments": [appointment_row(item) for item in self.db.query(Appointment).order_by(Appointment.id.desc()).all()],
            "prescriptions": [prescription_row(item) for item in self.db.query(Prescription).order_by(Prescription.id.desc()).all()],
            "pharmacy_orders": [pharmacy_order_row(item) for item in self.db.query(PharmacyOrder).order_by(PharmacyOrder.id.desc()).all()],
            "emergencies": [emergency_row(item) for item in self.db.query(EmergencyAlert).order_by(EmergencyAlert.id.desc()).all()],
            "messages": [message_row(item) for item in self.db.query(Message).order_by(Message.id.desc()).all()],
            "medical_records": [medical_record_row(item) for item in self.db.query(MedicalRecord).order_by(MedicalRecord.id.desc()).all()],
            "documents": [medical_record_row(item) for item in self.db.query(MedicalRecord).order_by(MedicalRecord.id.desc()).all()],
            "activities": [notification_row(item) for item in self.db.query(Notification).order_by(Notification.id.desc()).limit(8).all()],
            "history": [activity_row(item) for item in self.db.query(ActivityLog).order_by(ActivityLog.id.desc()).limit(100).all()]
            + [login_row(item) for item in self.db.query(LoginHistory).order_by(LoginHistory.id.desc()).limit(20).all()],
            "current_user": public_user(current) if current else None,
        }
        return payload

    def register(self, data: dict[str, object]) -> tuple[dict[str, object], int]:
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        phone = str(data.get("phone", "")).strip()
        password = str(data.get("password", ""))
        role = normalize_role(str(data.get("role", "patient")))
        specialty = str(data.get("specialty", "")).strip()
        if not name or not validate_email(email) or not phone or len(password) < 6:
            return {"error": "Nom, email valide, telephone et mot de passe de 6 caracteres minimum requis."}, 400
        exists = self.db.query(User).filter(or_(User.email == email, User.telephone == phone)).first()
        if exists:
            return {"error": "Ce compte existe deja."}, 409
        if role != "patient":
            request = RegistrationRequest(name=name, email=email, phone=phone, role=ROLE_LABELS[role], specialty=specialty, status="En attente")
            self.db.add(request)
            self._log(name, f"Demande {ROLE_LABELS[role]} envoyee", "En attente")
            self.db.commit()
            return {"message": "Demande envoyee a l'administration.", "request": request_row(request)}, 201
        nom, prenom = split_name(name)
        user = User(nom=nom, prenom=prenom, email=email, telephone=phone, mot_de_passe_hash=hash_password(password), role=role, title=ROLE_LABELS[role], specialty=specialty, statut="Actif")
        self.db.add(user)
        self.db.flush()
        self._notify(user.id, "Bienvenue sur ROUH", "Votre compte patient est actif.", "account")
        self._log(user.full_name, "Compte Patient cree", "Actif")
        self.db.commit()
        return {"message": "Compte patient cree.", "user": public_user(user)}, 201

    def login(self, identifier: str, password: str, ip: str, user_agent: str) -> tuple[dict[str, object], int]:
        clean = (identifier or "").strip().lower()
        phone = clean.replace(" ", "")
        user = self.db.query(User).filter(or_(User.email == clean, User.telephone == clean, User.telephone == phone)).first()
        success = bool(user and user.statut.lower() != "archive" and verify_password(password, user.mot_de_passe_hash))
        self.db.add(LoginHistory(user_id=user.id if user else None, email=clean, ip_address=ip, user_agent=user_agent, success=success))
        if not success:
            self.db.commit()
            return {"error": "Identifiants incorrects."}, 401
        self._log(user.full_name, "Connexion", "Succes")
        self.db.commit()
        return {"message": "Connexion reussie.", "user": public_user(user)}, 200

    def create_appointment(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self.db.get(User, user_id)
        item = Appointment(patient_id=user.id, patient_name=user.full_name, doctor_name=str(data.get("doctor", "")), scheduled_for=f"{data.get('date', '')} - {data.get('time', '')}", type="Teleconsultation" if data.get("teleconsultation") else "Cabinet", reason=str(data.get("reason", "")), status="En attente")
        self.db.add(item)
        self._log(user.full_name, "Demande de rendez-vous envoyee", "En attente")
        self.db.commit()
        return appointment_row(item)

    def update_appointment(self, appointment_id: int, data: dict[str, object], actor_id: int) -> dict[str, object]:
        item = self.db.get(Appointment, appointment_id)
        if not item:
            raise ValueError("Rendez-vous introuvable")
        for field, attr in {"status": "status", "date": "scheduled_for", "reason": "reason"}.items():
            if field in data:
                setattr(item, attr, str(data[field]))
        actor = self.db.get(User, actor_id)
        self._log(actor.full_name if actor else "Systeme", "Rendez-vous modifie", item.status)
        self.db.commit()
        return appointment_row(item)

    def create_prescription(self, doctor_id: int, data: dict[str, object]) -> dict[str, object]:
        doctor = self.db.get(User, doctor_id)
        doc = f"ordonnance_{token_urlsafe(5)}.pdf"
        item = Prescription(patient_name=str(data.get("patient", "")), doctor_id=doctor.id, doctor_name=doctor.full_name, medicine=str(data.get("medicine", "")), dosage=str(data.get("dosage", "")), instructions=str(data.get("instructions", "")), document=doc, status="Envoye pharmacie")
        self.db.add(item)
        self.db.flush()
        self.db.add(PharmacyOrder(prescription_id=item.id, patient_name=item.patient_name, doctor_name=item.doctor_name, document=doc, status="A traiter"))
        self._log(doctor.full_name, "Ordonnance creee", "Envoye pharmacie")
        self.db.commit()
        return prescription_row(item)

    def create_message(self, sender_id: int, data: dict[str, object]) -> dict[str, object]:
        sender = self.db.get(User, sender_id)
        recipient_name = str(data.get("to", "")).strip()
        recipient = next((user for user in self.db.query(User).all() if user.full_name == recipient_name), None)
        item = Message(sender_id=sender.id, recipient_id=recipient.id if recipient else None, sender_name=sender.full_name, recipient_name=recipient_name, role_label=ROLE_LABELS.get(sender.role, sender.role), body=str(data.get("body", "")).strip())
        if not item.body:
            raise ValueError("Message vide")
        self.db.add(item)
        self._notify(recipient.id if recipient else None, "Nouveau message", f"{sender.full_name} vous a envoye un message.", "message")
        self.db.commit()
        return message_row(item)

    def create_medical_record(self, doctor_id: int, data: dict[str, object]) -> dict[str, object]:
        doctor = self.db.get(User, doctor_id)
        item = MedicalRecord(doctor_id=doctor.id, patient_name=str(data.get("patient", "")), age=str(data.get("age", "")), weight=str(data.get("weight", "")), height=str(data.get("height", "")), blood=str(data.get("blood", "")), status=str(data.get("status", "")), description=str(data.get("description", "")), document_title=f"Dossier medical - {doctor.full_name}", source="Medecin")
        self.db.add(item)
        self._log(doctor.full_name, "Dossier medical envoye", "Archive")
        self.db.commit()
        return medical_record_row(item)

    def create_pharmacy_order(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self.db.get(User, user_id)
        item = PharmacyOrder(patient_id=user.id, patient_name=user.full_name, pharmacy_name=str(data.get("pharmacy", "")), document=str(data.get("document", "ordonnance_importee.pdf")), notes=str(data.get("notes", "")), status="Recu")
        self.db.add(item)
        self._log(user.full_name, "Commande pharmacie envoyee", "Recu")
        self.db.commit()
        return pharmacy_order_row(item)

    def create_emergency(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self.db.get(User, user_id)
        item = EmergencyAlert(patient_id=user.id, patient_name=user.full_name, type=str(data.get("type", "SOS patient")), location=str(data.get("location", "")), gravity="Critique", status="Nouveau", team="A assigner")
        self.db.add(item)
        self._log(user.full_name, "Alerte SOS declenchee", "Nouveau")
        self.db.commit()
        return emergency_row(item)

    def update_status(self, model_name: str, item_id: int, status: str, actor_id: int) -> dict[str, object]:
        mapping = {
            "request": (RegistrationRequest, request_row),
            "pharmacyOrder": (PharmacyOrder, pharmacy_order_row),
            "alert": (EmergencyAlert, emergency_row),
            "user": (User, public_user),
        }
        model, serializer = mapping[model_name]
        item = self.db.get(model, item_id)
        if not item:
            raise ValueError("Element introuvable")
        if isinstance(item, User):
            item.statut = status
        else:
            item.status = status
        actor = self.db.get(User, actor_id)
        self._log(actor.full_name if actor else "Systeme", f"Modification {model_name}", status)
        self.db.commit()
        return serializer(item)

    def save_profile(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self.db.get(User, user_id)
        nom, prenom = split_name(str(data.get("name", user.full_name)))
        email = str(data.get("email", user.email)).strip().lower()
        if not validate_email(email):
            raise ValueError("Email invalide")
        user.nom = nom
        user.prenom = prenom
        user.email = email
        user.telephone = str(data.get("phone", user.telephone)).strip()
        user.title = str(data.get("title", user.title)).strip()
        photo = str(data.get("photo", ""))
        if photo:
            user.photo_url = photo
        self._log(user.full_name, "Profil modifie", "Actif")
        self.db.commit()
        return public_user(user)

    def reset_password_request(self, email: str) -> dict[str, object]:
        user = self.db.query(User).filter(User.email == email.strip().lower()).first()
        token = token_urlsafe(24)
        if user:
            user.reset_token_hash = hash_password(token)
            self._log(user.full_name, "Demande reset password", "Envoye")
            self.db.commit()
        return {"message": "Si le compte existe, un lien de reinitialisation est genere.", "dev_token": token if user else ""}

    def _log(self, actor: str, event: str, status: str) -> None:
        self.db.add(ActivityLog(actor_name=actor, event=event, status=status))

    def _notify(self, user_id: int | None, title: str, body: str, type_: str) -> None:
        self.db.add(Notification(user_id=user_id, title=title, body=body, type=type_))
