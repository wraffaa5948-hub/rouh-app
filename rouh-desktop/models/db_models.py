from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def now_utc() -> datetime:
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nom: Mapped[str] = mapped_column(String(120), nullable=False)
    prenom: Mapped[str] = mapped_column(String(120), default="")
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    telephone: Mapped[str] = mapped_column(String(40), default="", index=True)
    mot_de_passe_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="patient", index=True)
    date_creation: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)
    statut: Mapped[str] = mapped_column(String(40), default="Actif", nullable=False)
    title: Mapped[str] = mapped_column(String(160), default="")
    specialty: Mapped[str] = mapped_column(String(160), default="")
    city: Mapped[str] = mapped_column(String(120), default="Casablanca")
    photo_url: Mapped[str] = mapped_column(Text, default="")
    reset_token_hash: Mapped[str] = mapped_column(String(255), default="")
    reset_token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    appointments_as_patient = relationship("Appointment", foreign_keys="Appointment.patient_id", back_populates="patient")
    appointments_as_doctor = relationship("Appointment", foreign_keys="Appointment.doctor_id", back_populates="doctor")

    @property
    def full_name(self) -> str:
        return f"{self.prenom} {self.nom}".strip() or self.email


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    doctor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    patient_name: Mapped[str] = mapped_column(String(180), default="")
    doctor_name: Mapped[str] = mapped_column(String(180), default="")
    scheduled_for: Mapped[str] = mapped_column(String(120), default="")
    type: Mapped[str] = mapped_column(String(60), default="Cabinet")
    reason: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="En attente")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="appointments_as_doctor")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    doctor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    patient_name: Mapped[str] = mapped_column(String(180), default="")
    age: Mapped[str] = mapped_column(String(30), default="")
    weight: Mapped[str] = mapped_column(String(30), default="")
    height: Mapped[str] = mapped_column(String(30), default="")
    blood: Mapped[str] = mapped_column(String(20), default="")
    status: Mapped[str] = mapped_column(String(60), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    document_title: Mapped[str] = mapped_column(String(255), default="")
    source: Mapped[str] = mapped_column(String(80), default="Medecin")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    doctor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    patient_name: Mapped[str] = mapped_column(String(180), default="")
    doctor_name: Mapped[str] = mapped_column(String(180), default="")
    medicine: Mapped[str] = mapped_column(String(255), default="")
    dosage: Mapped[str] = mapped_column(String(120), default="")
    instructions: Mapped[str] = mapped_column(Text, default="")
    document: Mapped[str] = mapped_column(String(255), default="")
    total: Mapped[str] = mapped_column(String(80), default="")
    status: Mapped[str] = mapped_column(String(80), default="Envoye pharmacie")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class PharmacyOrder(Base):
    __tablename__ = "pharmacy_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    prescription_id: Mapped[Optional[int]] = mapped_column(ForeignKey("prescriptions.id"), nullable=True)
    patient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    pharmacy_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    patient_name: Mapped[str] = mapped_column(String(180), default="")
    doctor_name: Mapped[str] = mapped_column(String(180), default="")
    pharmacy_name: Mapped[str] = mapped_column(String(180), default="")
    document: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(80), default="Recu")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    patient_name: Mapped[str] = mapped_column(String(180), default="")
    type: Mapped[str] = mapped_column(String(120), default="SOS patient")
    location: Mapped[str] = mapped_column(Text, default="")
    gravity: Mapped[str] = mapped_column(String(60), default="Critique")
    status: Mapped[str] = mapped_column(String(80), default="Nouveau")
    team: Mapped[str] = mapped_column(String(120), default="A assigner")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sender_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    recipient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    sender_name: Mapped[str] = mapped_column(String(180), default="")
    recipient_name: Mapped[str] = mapped_column(String(180), default="")
    role_label: Mapped[str] = mapped_column(String(80), default="")
    body: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    body: Mapped[str] = mapped_column(Text, default="")
    type: Mapped[str] = mapped_column(String(80), default="info")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class LoginHistory(Base):
    __tablename__ = "login_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(255), default="")
    ip_address: Mapped[str] = mapped_column(String(80), default="")
    user_agent: Mapped[str] = mapped_column(Text, default="")
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    actor_name: Mapped[str] = mapped_column(String(180), default="Systeme")
    event: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class RegistrationRequest(Base):
    __tablename__ = "registration_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(40), default="")
    role: Mapped[str] = mapped_column(String(80), default="Patient")
    specialty: Mapped[str] = mapped_column(String(160), default="")
    status: Mapped[str] = mapped_column(String(80), default="En attente")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


BaseModelImport = (
    User,
    Appointment,
    MedicalRecord,
    Prescription,
    PharmacyOrder,
    EmergencyAlert,
    Message,
    Notification,
    LoginHistory,
    ActivityLog,
    RegistrationRequest,
)
