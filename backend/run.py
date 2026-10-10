"""Development entrypoint for Veyra backend server."""

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
from backend.app import create_app

# Load environment variables from .env if present
load_dotenv()

env_name = os.getenv("FLASK_ENV", "development")
app = create_app(env_name)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("FLASK_DEBUG", "1") == "1"

    print(f"[*] Starting Veyra API ({env_name}) on http://{host}:{port}/api/v1")
    app.run(host=host, port=port, debug=debug)
