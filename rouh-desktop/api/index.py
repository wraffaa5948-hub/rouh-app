from __future__ import annotations

import sys
from pathlib import Path

from flask import Flask, jsonify, render_template, request, session
from werkzeug.middleware.proxy_fix import ProxyFix


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from controllers.app_controller import WebAppController
from config import config
from database import get_session, init_db, remove_session

app = Flask(__name__)
app.template_folder = str(BASE_DIR / "templates")
app.static_folder = str(BASE_DIR / "static")
app.config.from_object(config)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
init_db()


@app.teardown_appcontext
def shutdown_session(exception=None):
    remove_session(exception)


def controller() -> WebAppController:
    return WebAppController(get_session())


def current_user_id() -> int | None:
    return session.get("user_id")


def require_auth() -> int:
    user_id = current_user_id()
    if not user_id:
        raise PermissionError("Authentification requise")
    return int(user_id)


def json_data() -> dict[str, object]:
    if request.is_json:
        return request.get_json(silent=True) or {}
    return dict(request.form)


@app.errorhandler(PermissionError)
def auth_error(error):
    return jsonify({"error": str(error)}), 401


@app.errorhandler(ValueError)
def value_error(error):
    return jsonify({"error": str(error)}), 400


@app.get("/")
def index() -> str:
    return render_template("index.html")


@app.get("/api/bootstrap")
def bootstrap():
    return jsonify(controller().get_bootstrap_payload(current_user_id()))


@app.post("/register")
@app.post("/api/register")
def register():
    payload, status = controller().register(json_data())
    return jsonify(payload), status


@app.post("/login")
@app.post("/api/login")
def login():
    data = json_data()
    payload, status = controller().login(
        str(data.get("identifier", "")),
        str(data.get("password", "")),
        request.headers.get("X-Forwarded-For", request.remote_addr or ""),
        request.headers.get("User-Agent", ""),
    )
    if status == 200 and "user" in payload:
        session.clear()
        session["user_id"] = payload["user"]["db_id"]
        session.permanent = True
    return jsonify(payload), status


@app.post("/logout")
@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"message": "Deconnexion reussie."})


@app.get("/dashboard")
@app.get("/api/dashboard")
def dashboard():
    return jsonify(controller().get_bootstrap_payload(current_user_id()))


@app.route("/appointments", methods=["GET", "POST"])
@app.route("/api/appointments", methods=["GET", "POST"])
def appointments():
    user_id = require_auth()
    ctl = controller()
    if request.method == "POST":
        return jsonify({"appointment": ctl.create_appointment(user_id, json_data())}), 201
    return jsonify({"appointments": ctl.get_bootstrap_payload(user_id)["appointments"]})


@app.patch("/api/appointments/<int:item_id>")
def appointment_update(item_id: int):
    return jsonify({"appointment": controller().update_appointment(item_id, json_data(), require_auth())})


@app.route("/prescriptions", methods=["GET", "POST"])
@app.route("/api/prescriptions", methods=["GET", "POST"])
def prescriptions():
    user_id = require_auth()
    ctl = controller()
    if request.method == "POST":
        return jsonify({"prescription": ctl.create_prescription(user_id, json_data())}), 201
    return jsonify({"prescriptions": ctl.get_bootstrap_payload(user_id)["prescriptions"]})


@app.route("/messages", methods=["GET", "POST"])
@app.route("/api/messages", methods=["GET", "POST"])
def messages():
    user_id = require_auth()
    ctl = controller()
    if request.method == "POST":
        return jsonify({"message": ctl.create_message(user_id, json_data())}), 201
    return jsonify({"messages": ctl.get_bootstrap_payload(user_id)["messages"]})


@app.post("/api/medical-records")
def medical_records():
    return jsonify({"record": controller().create_medical_record(require_auth(), json_data())}), 201


@app.post("/api/pharmacy-orders")
def pharmacy_orders():
    data = json_data()
    if "document" not in data and request.files.get("document"):
        data["document"] = request.files["document"].filename
    return jsonify({"order": controller().create_pharmacy_order(require_auth(), data)}), 201


@app.post("/api/emergency-alerts")
def emergency_alerts():
    return jsonify({"alert": controller().create_emergency(require_auth(), json_data())}), 201


@app.patch("/api/status/<model_name>/<int:item_id>")
def update_status(model_name: str, item_id: int):
    data = json_data()
    return jsonify({"item": controller().update_status(model_name, item_id, str(data.get("status", "")), require_auth())})


@app.patch("/api/profile")
def update_profile():
    return jsonify({"user": controller().save_profile(require_auth(), json_data())})


@app.post("/api/password/reset")
def reset_password():
    return jsonify(controller().reset_password_request(str(json_data().get("email", ""))))


@app.get("/health")
def health():
    return {"status": "ok", "app": "ROUH"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8010, debug=False)
