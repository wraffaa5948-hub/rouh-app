from __future__ import annotations

from datetime import datetime

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


ROLE_LABELS = {
    "admin": "Administrateur",
    "patient": "Patient",
    "doctor": "Medecin",
    "nurse": "Infirmier",
    "pharmacy": "Pharmacie",
    "emergency": "Urgence",
}


def dt(value: datetime | None) -> str:
    if not value:
        return ""
    return value.strftime("%d/%m/%Y %H:%M")


def public_user(user: User) -> dict[str, object]:
    name = user.full_name
    return {
        "id": f"USR-{user.id:03d}",
        "db_id": user.id,
        "role": user.role,
        "role_label": ROLE_LABELS.get(user.role, user.role),
        "name": name,
        "email": user.email,
        "phone": user.telephone,
        "city": user.city,
        "status": user.statut,
        "title": user.title or ROLE_LABELS.get(user.role, user.role),
        "specialty": user.specialty,
        "avatar": "".join(part[0].upper() for part in name.split()[:2]) or "RO",
        "photo": user.photo_url,
    }


def appointment_row(item: Appointment) -> dict[str, object]:
    patient = item.patient_name or (item.patient.full_name if item.patient else "")
    doctor = item.doctor_name or (item.doctor.full_name if item.doctor else "")
    return {
        "id": f"RDV-{item.id:03d}",
        "db_id": item.id,
        "patient": patient,
        "doctor": doctor,
        "date": item.scheduled_for,
        "type": item.type,
        "reason": item.reason,
        "status": item.status,
    }


def medical_record_row(item: MedicalRecord) -> dict[str, object]:
    return {
        "id": f"REC-{item.id:03d}",
        "db_id": item.id,
        "patient": item.patient_name,
        "age": item.age,
        "weight": item.weight,
        "height": item.height,
        "blood": item.blood,
        "status": item.status,
        "description": item.description,
        "title": item.document_title or f"Dossier medical - {item.patient_name}",
        "type": "Dossier",
        "source": item.source,
        "date": dt(item.created_at),
    }


def prescription_row(item: Prescription) -> dict[str, object]:
    return {
        "id": f"ORD-{item.id:03d}",
        "db_id": item.id,
        "patient": item.patient_name,
        "doctor": item.doctor_name,
        "medicine": item.medicine,
        "dosage": item.dosage,
        "instructions": item.instructions,
        "document": item.document or f"ordonnance_{item.id}.pdf",
        "date": dt(item.created_at),
        "status": item.status,
        "total": item.total,
    }


def pharmacy_order_row(item: PharmacyOrder) -> dict[str, object]:
    return {
        "id": f"ORD-{item.id:03d}",
        "db_id": item.id,
        "patient": item.patient_name,
        "doctor": item.doctor_name,
        "pharmacy": item.pharmacy_name,
        "document": item.document,
        "notes": item.notes,
        "date": dt(item.created_at),
        "status": item.status,
    }


def emergency_row(item: EmergencyAlert) -> dict[str, object]:
    return {
        "id": f"SOS-{item.id:03d}",
        "db_id": item.id,
        "patient": item.patient_name,
        "type": item.type,
        "location": item.location,
        "gravity": item.gravity,
        "status": item.status,
        "team": item.team,
        "time": dt(item.created_at),
    }


def message_row(item: Message) -> dict[str, object]:
    return {
        "id": f"MSG-{item.id:03d}",
        "db_id": item.id,
        "from": item.sender_name,
        "to": item.recipient_name,
        "role": item.role_label,
        "body": item.body,
        "time": dt(item.created_at),
    }


def request_row(item: RegistrationRequest) -> dict[str, object]:
    return {
        "id": f"REQ-{item.id:03d}",
        "db_id": item.id,
        "name": item.name,
        "role": item.role,
        "email": item.email,
        "phone": item.phone,
        "specialty": item.specialty,
        "date": dt(item.created_at),
        "status": item.status,
    }


def activity_row(item: ActivityLog) -> dict[str, object]:
    return {"date": dt(item.created_at), "actor": item.actor_name, "event": item.event, "status": item.status}


def login_row(item: LoginHistory) -> dict[str, object]:
    return {"date": dt(item.created_at), "actor": item.email, "event": "Connexion", "status": "Succes" if item.success else "Echec"}


def notification_row(item: Notification) -> dict[str, object]:
    return {"title": item.title, "type": item.type, "time": dt(item.created_at), "body": item.body, "read": item.read}
