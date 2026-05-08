from __future__ import annotations

import sys
from pathlib import Path

from flask import Flask, jsonify, render_template


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from controllers.app_controller import WebAppController

app = Flask(__name__)
app.template_folder = str(BASE_DIR / "templates")
app.static_folder = str(BASE_DIR / "static")
controller = WebAppController()


@app.get("/")
def index() -> str:
    return render_template("index.html")


@app.get("/api/bootstrap")
def bootstrap():
    return jsonify(controller.get_bootstrap_payload())


@app.get("/health")
def health():
    return {"status": "ok", "app": "ROUH"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8010, debug=False)
