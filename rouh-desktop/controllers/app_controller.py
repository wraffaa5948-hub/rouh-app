from __future__ import annotations

from sqlalchemy.orm import Session

from services.account_service import AccountService
from services.bootstrap_service import BootstrapService
from services.medical_service import MedicalService
from services.status_service import StatusService


class WebAppController:
    """Facade MVC appelee par Flask.

    Les sous-services gardent le code modulaire: inscription/authentification,
    donnees de demarrage, actions medicales et changements de statut.
    """

    def __init__(self, db: Session):
        self.db = db
        self.bootstrap = BootstrapService(db)
        self.accounts = AccountService(db)
        self.medical = MedicalService(db)
        self.status = StatusService(db)
        self.seed_if_empty()

    def seed_if_empty(self) -> None:
        self.bootstrap.seed_if_empty()

    def get_bootstrap_payload(self, current_user_id: int | None = None) -> dict[str, object]:
        return self.bootstrap.payload(current_user_id)

    def register(self, data: dict[str, object]) -> tuple[dict[str, object], int]:
        return self.accounts.register(data)

    def login(self, identifier: str, password: str, ip: str, user_agent: str) -> tuple[dict[str, object], int]:
        return self.accounts.login(identifier, password, ip, user_agent)

    def save_profile(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.accounts.save_profile(user_id, data)

    def reset_password_request(self, email: str) -> dict[str, object]:
        return self.accounts.reset_password_request(email)

    def confirm_password_reset(self, email: str, code: str, new_password: str) -> dict[str, object]:
        return self.accounts.confirm_password_reset(email, code, new_password)

    def create_appointment(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.medical.create_appointment(user_id, data)

    def update_appointment(self, appointment_id: int, data: dict[str, object], actor_id: int) -> dict[str, object]:
        return self.medical.update_appointment(appointment_id, data, actor_id)

    def create_prescription(self, doctor_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.medical.create_prescription(doctor_id, data)

    def create_message(self, sender_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.medical.create_message(sender_id, data)

    def create_medical_record(self, doctor_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.medical.create_medical_record(doctor_id, data)

    def create_pharmacy_order(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.medical.create_pharmacy_order(user_id, data)

    def create_emergency(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        return self.medical.create_emergency(user_id, data)

    def update_status(self, model_name: str, item_id: int, status: str, actor_id: int) -> dict[str, object]:
        return self.status.update_status(model_name, item_id, status, actor_id)
