"""Flask application factory for Veyra."""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.app.config import config_by_name
from backend.app.models.base import db
from backend.app.routes import (
    health_bp,
    profile_bp,
    wardrobe_bp,
    recommendations_bp,
    measurements_bp,
    quiz_bp,
    constraints_bp,
    account_bp,
)


def create_app(config_name: str = None) -> Flask:
    """Create and configure the Flask application instance."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    config_cls = config_by_name.get(config_name, config_by_name["development"])
    app.config.from_object(config_cls)

    # Initialize CORS restricted to configured origins
    origins = app.config.get("CORS_ORIGINS", ["http://localhost:5173", "http://localhost:3000"])
    CORS(app, resources={r"/api/*": {"origins": origins}})

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    api_prefix = app.config.get("API_PREFIX", "/api/v1")
    app.register_blueprint(health_bp, url_prefix=api_prefix)
    app.register_blueprint(profile_bp, url_prefix=api_prefix)
    app.register_blueprint(wardrobe_bp, url_prefix=api_prefix)
    app.register_blueprint(recommendations_bp, url_prefix=api_prefix)
    app.register_blueprint(measurements_bp, url_prefix=api_prefix)
    app.register_blueprint(quiz_bp, url_prefix=api_prefix)
    app.register_blueprint(constraints_bp, url_prefix=api_prefix)
    app.register_blueprint(account_bp, url_prefix=api_prefix)

    # Global Error Handlers
    @app.errorhandler(400)
    def handle_bad_request(err):
        return jsonify({"error": "Bad request", "message": str(err.description)}), 400

    @app.errorhandler(404)
    def handle_not_found(err):
        return jsonify({"error": "Resource not found", "message": str(err.description)}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(err):
        return jsonify({"error": "Method not allowed", "message": str(err.description)}), 405

    @app.errorhandler(500)
    def handle_internal_error(err):
        return jsonify({"error": "Internal server error", "message": "An unexpected error occurred."}), 500

    # In testing mode (in-memory SQLite), create tables directly for test execution speed
    if app.config.get("TESTING"):
        with app.app_context():
            db.create_all()

    return app
