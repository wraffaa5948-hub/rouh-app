from __future__ import annotations

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
from services.security import hash_password
from services.serializers import (
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
from services.validators import normalize_role, split_name


class BootstrapService:
    """Initialise les donnees de demo et construit le payload principal."""

    def __init__(self, db: Session):
        self.db = db

    def seed_if_empty(self) -> None:
        if self.db.query(User).first():
            return
        demo = get_fake_database()
        for account in demo["accounts"]:
            nom, prenom = split_name(account["name"])
            email = account["email"].lower()
            if email == "fatima.zahra@rouh.ma" and normalize_role(account["role"]) == "patient":
                email = "fatima.patient@rouh.ma"
            self.db.add(
                User(
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
            )
        self.db.flush()
        for row in demo["registration_requests"]:
            self.db.add(
                RegistrationRequest(
                    name=row["name"],
                    email=row["email"],
                    phone=row.get("phone", ""),
                    role=row["role"],
                    specialty=row.get("specialty", ""),
                    status=row["status"],
                )
            )
        for row in demo["appointments"]:
            self.db.add(
                Appointment(
                    patient_name=row["patient"],
                    doctor_name=row["doctor"],
                    scheduled_for=row["date"],
                    type=row["type"],
                    reason=row["reason"],
                    status=row["status"],
                )
            )
        for row in demo["prescriptions"]:
            document = row.get("document", f"{row['id']}.pdf")
            self.db.add(
                Prescription(
                    patient_name=row["patient"],
                    doctor_name=row["doctor"],
                    total=row.get("total", ""),
                    status=row["status"],
                    document=document,
                )
            )
            self.db.add(
                PharmacyOrder(
                    patient_name=row["patient"],
                    doctor_name=row["doctor"],
                    document=document,
                    status=row["status"],
                )
            )
        for row in demo["emergencies"]:
            self.db.add(
                EmergencyAlert(
                    patient_name=row["patient"],
                    type=row["type"],
                    location=row["location"],
                    gravity=row["gravity"],
                    status=row["status"],
                    team=row["team"],
                )
            )
        for row in demo["history"]:
            self.db.add(ActivityLog(actor_name=row["actor"], event=row["event"], status=row["status"]))
        self.db.add(ActivityLog(actor_name="Systeme", event="Base initialisee", status="Actif"))
        self.db.commit()

    def payload(self, current_user_id: int | None = None) -> dict[str, object]:
        demo = get_fake_database()
        users = self.db.query(User).order_by(User.id).all()
        doctors = [public_user(user) for user in users if user.role == "doctor"]
        nurses = [public_user(user) for user in users if user.role == "nurse"]
        pharmacies = [public_user(user) for user in users if user.role == "pharmacy"]
        patients = [public_user(user) for user in users if user.role == "patient"]
        current = self.db.get(User, current_user_id) if current_user_id else None
        return {
            **demo,
            "accounts": [public_user(user) for user in users],
            "doctors": [{**item, "experience": "-", "rating": "4.8"} for item in doctors],
            "nurses": nurses,
            "pharmacies": [{**item, "address": item["city"]} for item in pharmacies],
            "patients": [{**item, "age": "-", "room": "-", "doctor": "-"} for item in patients],
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
