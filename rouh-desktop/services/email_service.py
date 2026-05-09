from __future__ import annotations

import smtplib
from email.message import EmailMessage


def send_reset_code(config, recipient: str, code: str) -> bool:
    if not config.SMTP_PASSWORD:
        return False

    message = EmailMessage()
    message["Subject"] = "Code de reinitialisation ROUH"
    message["From"] = config.SMTP_FROM
    message["To"] = recipient
    message.set_content(
        "\n".join(
            [
                "Bonjour,",
                "",
                f"Votre code de reinitialisation ROUH est : {code}",
                "Ce code expire dans 15 minutes.",
                "",
                "Si vous n'avez pas demande cette operation, ignorez ce message.",
                "",
                "Equipe ROUH",
            ]
        )
    )

    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=12) as smtp:
            smtp.starttls()
            smtp.login(config.SMTP_USER, config.SMTP_PASSWORD)
            smtp.send_message(message)
        return True
    except OSError:
        return False
    except smtplib.SMTPException:
        return False
