from __future__ import annotations

from datetime import datetime, timedelta
from random import SystemRandom

from sqlalchemy import or_
from sqlalchemy.orm import Session

from config import config
from models.db_models import ActivityLog, LoginHistory, Notification, RegistrationRequest, User
from services.email_service import send_reset_code
from services.security import hash_password, verify_password
from services.serializers import ROLE_LABELS, public_user, request_row
from services.validators import normalize_role, split_name, validate_email


class AccountService:
    """Regroupe authentification, inscription, profil et mot de passe."""

    def __init__(self, db: Session):
        self.db = db

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
            request = RegistrationRequest(
                name=name,
                email=email,
                phone=phone,
                role=ROLE_LABELS[role],
                specialty=specialty,
                status="En attente",
            )
            self.db.add(request)
            self._log(name, f"Demande {ROLE_LABELS[role]} envoyee", "En attente")
            self.db.commit()
            return {"message": "Demande envoyee a l'administration.", "request": request_row(request)}, 201
        nom, prenom = split_name(name)
        user = User(
            nom=nom,
            prenom=prenom,
            email=email,
            telephone=phone,
            mot_de_passe_hash=hash_password(password),
            role=role,
            title=ROLE_LABELS[role],
            specialty=specialty,
            statut="Actif",
        )
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

    def save_profile(self, user_id: int, data: dict[str, object]) -> dict[str, object]:
        user = self.db.get(User, user_id)
        if not user:
            raise ValueError("Utilisateur introuvable")
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
        if user:
            code = f"{SystemRandom().randint(100000, 999999)}"
            user.reset_token_hash = hash_password(code)
            user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=15)
            email_sent = send_reset_code(config, user.email, code)
            status = "Envoye" if email_sent else "SMTP non configure"
            self._log(user.full_name, "Code reset password genere", status)
            self.db.commit()
        return {"message": "Si le compte existe, un code de verification est envoye par email."}

    def confirm_password_reset(self, email: str, code: str, new_password: str) -> dict[str, object]:
        user = self.db.query(User).filter(User.email == email.strip().lower()).first()
        if not user or not user.reset_token_hash:
            raise ValueError("Code invalide ou expire.")
        if user.reset_token_expires_at and user.reset_token_expires_at < datetime.utcnow():
            user.reset_token_hash = ""
            user.reset_token_expires_at = None
            self.db.commit()
            raise ValueError("Code invalide ou expire.")
        if not verify_password(code.strip(), user.reset_token_hash):
            raise ValueError("Code invalide ou expire.")
        if len(new_password) < 6:
            raise ValueError("Le mot de passe doit contenir au moins 6 caracteres.")
        user.mot_de_passe_hash = hash_password(new_password)
        user.reset_token_hash = ""
        user.reset_token_expires_at = None
        self._log(user.full_name, "Mot de passe reinitialise", "Succes")
        self.db.commit()
        return {"message": "Mot de passe reinitialise avec succes."}

    def _log(self, actor: str, event: str, status: str) -> None:
        self.db.add(ActivityLog(actor_name=actor, event=event, status=status))

    def _notify(self, user_id: int | None, title: str, body: str, type_: str) -> None:
        self.db.add(Notification(user_id=user_id, title=title, body=body, type=type_))
