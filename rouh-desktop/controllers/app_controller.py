from __future__ import annotations

from models.data_model import get_fake_database


class WebAppController:
    def get_bootstrap_payload(self) -> dict[str, object]:
        return get_fake_database()
