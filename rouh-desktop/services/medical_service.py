from __future__ import annotations

from secrets import token_urlsafe

from sqlalchemy.orm import Session

from models.db_models import ActivityLog, Appointment, EmergencyAlert, MedicalRecord, Message, Notification, PharmacyOrder, Prescription, User
from services.serializers import ROLE_LABELS, appointment_row, emergency_row, medical_record_row, message_row, pharmacy_order_row, prescription_row


class MedicalService:
    """Actions metier liees aux soins, rendez-vous, messages et pharmacie."""

    def __init__(self, db: Session):
        self.db = db

    def create_appointment(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self._user(user_id)
        item = Appointment(
            patient_id=user.id,
            patient_name=user.full_name,
            doctor_name=str(data.get("doctor", "")),
            scheduled_for=f"{data.get('date', '')} - {data.get('time', '')}",
            type="Teleconsultation" if data.get("teleconsultation") else "Cabinet",
            reason=str(data.get("reason", "")),
            status="En attente",
        )
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
        doctor = self._user(doctor_id)
        document = f"ordonnance_{token_urlsafe(5)}.pdf"
        item = Prescription(
            patient_name=str(data.get("patient", "")),
            doctor_id=doctor.id,
            doctor_name=doctor.full_name,
            medicine=str(data.get("medicine", "")),
            dosage=str(data.get("dosage", "")),
            instructions=str(data.get("instructions", "")),
            document=document,
            status="Envoye pharmacie",
        )
        self.db.add(item)
        self.db.flush()
        self.db.add(PharmacyOrder(prescription_id=item.id, patient_name=item.patient_name, doctor_name=item.doctor_name, document=document, status="A traiter"))
        self._log(doctor.full_name, "Ordonnance creee", "Envoye pharmacie")
        self.db.commit()
        return prescription_row(item)

    def create_message(self, sender_id: int, data: dict[str, object]) -> dict[str, object]:
        sender = self._user(sender_id)
        recipient_name = str(data.get("to", "")).strip()
        recipient = next((user for user in self.db.query(User).all() if user.full_name == recipient_name), None)
        item = Message(
            sender_id=sender.id,
            recipient_id=recipient.id if recipient else None,
            sender_name=sender.full_name,
            recipient_name=recipient_name,
            role_label=ROLE_LABELS.get(sender.role, sender.role),
            body=str(data.get("body", "")).strip(),
        )
        if not item.body:
            raise ValueError("Message vide")
        self.db.add(item)
        self._notify(recipient.id if recipient else None, "Nouveau message", f"{sender.full_name} vous a envoye un message.", "message")
        self.db.commit()
        return message_row(item)

    def create_medical_record(self, doctor_id: int, data: dict[str, object]) -> dict[str, object]:
        doctor = self._user(doctor_id)
        item = MedicalRecord(
            doctor_id=doctor.id,
            patient_name=str(data.get("patient", "")),
            age=str(data.get("age", "")),
            weight=str(data.get("weight", "")),
            height=str(data.get("height", "")),
            blood=str(data.get("blood", "")),
            status=str(data.get("status", "")),
            description=str(data.get("description", "")),
            document_title=f"Dossier medical - {doctor.full_name}",
            source="Medecin",
        )
        self.db.add(item)
        self._log(doctor.full_name, "Dossier medical envoye", "Archive")
        self.db.commit()
        return medical_record_row(item)

    def create_pharmacy_order(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self._user(user_id)
        item = PharmacyOrder(
            patient_id=user.id,
            patient_name=user.full_name,
            pharmacy_name=str(data.get("pharmacy", "")),
            document=str(data.get("document", "ordonnance_importee.pdf")),
            notes=str(data.get("notes", "")),
            status="Recu",
        )
        self.db.add(item)
        self._log(user.full_name, "Commande pharmacie envoyee", "Recu")
        self.db.commit()
        return pharmacy_order_row(item)

    def create_emergency(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self._user(user_id)
        item = EmergencyAlert(
            patient_id=user.id,
            patient_name=user.full_name,
            type=str(data.get("type", "SOS patient")),
            location=str(data.get("location", "")),
            gravity="Critique",
            status="Nouveau",
            team="A assigner",
        )
        self.db.add(item)
        self._log(user.full_name, "Alerte SOS declenchee", "Nouveau")
        self.db.commit()
        return emergency_row(item)

    def _user(self, user_id: int) -> User:
        user = self.db.get(User, user_id)
        if not user:
            raise ValueError("Utilisateur introuvable")
        return user

    def _log(self, actor: str, event: str, status: str) -> None:
        self.db.add(ActivityLog(actor_name=actor, event=event, status=status))

    def _notify(self, user_id: int | None, title: str, body: str, type_: str) -> None:
        self.db.add(Notification(user_id=user_id, title=title, body=body, type=type_))
