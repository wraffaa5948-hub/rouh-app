from __future__ import annotations

from sqlalchemy.orm import Session

from models.db_models import ActivityLog, EmergencyAlert, PharmacyOrder, RegistrationRequest, User
from services.serializers import emergency_row, pharmacy_order_row, public_user, request_row


class StatusService:
    """Centralise les changements de statut depuis l'administration et les equipes."""

    def __init__(self, db: Session):
        self.db = db

    def update_status(self, model_name: str, item_id: int, status: str, actor_id: int) -> dict[str, object]:
        mapping = {
            "request": (RegistrationRequest, request_row),
            "pharmacyOrder": (PharmacyOrder, pharmacy_order_row),
            "alert": (EmergencyAlert, emergency_row),
            "user": (User, public_user),
        }
        if model_name not in mapping:
            raise ValueError("Type de statut inconnu")
        model, serializer = mapping[model_name]
        item = self.db.get(model, item_id)
        if not item:
            raise ValueError("Element introuvable")
        if isinstance(item, User):
            item.statut = status
        else:
            item.status = status
        actor = self.db.get(User, actor_id)
        self.db.add(ActivityLog(actor_name=actor.full_name if actor else "Systeme", event=f"Modification {model_name}", status=status))
        self.db.commit()
        return serializer(item)
