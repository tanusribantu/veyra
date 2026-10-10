from backend.app.routes.health import bp as health_bp
from backend.app.routes.profile import bp as profile_bp
from backend.app.routes.wardrobe import bp as wardrobe_bp
from backend.app.routes.recommendations import bp as recommendations_bp
from backend.app.routes.measurements import bp as measurements_bp
from backend.app.routes.quiz import bp as quiz_bp
from backend.app.routes.constraints import bp as constraints_bp

__all__ = [
    "health_bp",
    "profile_bp",
    "wardrobe_bp",
    "recommendations_bp",
    "measurements_bp",
    "quiz_bp",
    "constraints_bp",
]
