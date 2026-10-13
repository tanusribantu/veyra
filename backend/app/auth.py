"""Authentication and authorization utilities for Veyra using Supabase Auth JWKS."""

import logging
from functools import wraps
from typing import Optional, Dict, Any
from flask import request, jsonify, current_app, g
import jwt
from jwt import PyJWKClient, ExpiredSignatureError, InvalidTokenError
from backend.app.models.base import db
from backend.app.models.user import User

logger = logging.getLogger(__name__)

# Cache of PyJWKClients per Supabase URL
_jwks_clients: Dict[str, PyJWKClient] = {}


class AuthError(Exception):
    """Custom exception for authentication errors."""
    def __init__(self, message: str, status_code: int = 401):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def get_jwks_client(supabase_url: str) -> PyJWKClient:
    """Retrieve or initialize PyJWKClient for the given Supabase instance."""
    normalized_url = supabase_url.rstrip("/")
    if normalized_url not in _jwks_clients:
        jwks_url = f"{normalized_url}/auth/v1/.well-known/jwks.json"
        _jwks_clients[normalized_url] = PyJWKClient(jwks_url, cache_keys=True, max_cached_keys=16)
    return _jwks_clients[normalized_url]


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """Verify Supabase JWT using JWKS according to current Supabase documentation.
    
    Supports RS256 and ES256 asymmetric signing keys exposed at
    {SUPABASE_URL}/auth/v1/.well-known/jwks.json.
    """
    # 1. Allow test key override in testing mode
    test_key = current_app.config.get("JWT_TEST_VERIFY_KEY")
    if test_key:
        algorithm = current_app.config.get("JWT_TEST_ALGORITHM", "HS256")
        try:
            payload = jwt.decode(
                token,
                test_key,
                algorithms=[algorithm],
                options={"verify_exp": True, "verify_aud": False, "verify_signature": True},
            )
            return payload
        except ExpiredSignatureError:
            raise AuthError("Token has expired", 401)
        except InvalidTokenError as exc:
            raise AuthError(f"Invalid token: {str(exc)}", 401)

    # 2. Production / Dev Supabase JWKS verification
    supabase_url = current_app.config.get("SUPABASE_URL", "")
    if not supabase_url:
        raise AuthError("Authentication provider not configured on server", 500)

    try:
        client = get_jwks_client(supabase_url)
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            audience="authenticated",
            options={"verify_exp": True, "verify_aud": True, "verify_signature": True},
        )
        return payload
    except ExpiredSignatureError:
        raise AuthError("Token has expired", 401)
    except InvalidTokenError as exc:
        raise AuthError(f"Invalid token: {str(exc)}", 401)
    except Exception as exc:
        logger.warning("JWKS token verification failed: %s", str(exc))
        raise AuthError(f"Token verification failed: {str(exc)}", 401)


def get_or_create_auth_user(auth_user_id: str, email: Optional[str] = None) -> User:
    """Derive local User entity from verified Supabase auth_user_id, creating on first login."""
    user = User.query.filter_by(auth_user_id=auth_user_id).first()
    if user:
        if email and user.email != email:
            user.email = email
            db.session.commit()
        return user

    # If no record matches auth_user_id, check if existing user matches email
    if email:
        user = User.query.filter_by(email=email).first()
        if user:
            user.auth_user_id = auth_user_id
            db.session.commit()
            return user

    # Create new User on first login
    import uuid
    user = User(
        id=f"usr_{uuid.uuid4().hex[:12]}",
        auth_user_id=auth_user_id,
        email=email,
    )
    db.session.add(user)
    db.session.commit()
    return user


def require_auth(f):
    """Decorator requiring a verified Supabase JWT for protected endpoints.
    
    Extracts Bearer token, verifies via JWKS, derives User, and sets g.current_user.
    X-User-ID header is strictly ignored unless ALLOW_DEV_AUTH_OVERRIDE is enabled.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        # 1. Dev Auth Override (only if explicitly enabled in non-production)
        allow_dev_override = current_app.config.get("ALLOW_DEV_AUTH_OVERRIDE", False)
        is_production = current_app.config.get("ENV") == "production" or not current_app.config.get("DEBUG", False)

        if not auth_header:
            if allow_dev_override and not is_production:
                dev_user_id = request.headers.get("X-User-ID", "user_001")
                from backend.app.services.profile_service import ProfileService
                user = ProfileService.get_or_create_user(dev_user_id)
                g.current_user = user
                g.current_user_id = user.id
                return f(*args, **kwargs)

            return jsonify({
                "error": "Unauthorized",
                "message": "Missing authorization token",
            }), 401

        # 2. Bearer token extraction
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "error": "Unauthorized",
                "message": "Authorization header must be formatted as 'Bearer <token>'",
            }), 401

        token = parts[1]

        # 3. Token verification via JWKS
        try:
            payload = verify_supabase_token(token)
        except AuthError as err:
            return jsonify({
                "error": "Unauthorized",
                "message": err.message,
            }), err.status_code

        sub = payload.get("sub")
        if not sub:
            return jsonify({
                "error": "Unauthorized",
                "message": "Token missing subject identifier",
            }), 401

        email = payload.get("email")
        user = get_or_create_auth_user(auth_user_id=sub, email=email)
        g.current_user = user
        g.current_user_id = user.id

        return f(*args, **kwargs)

    return decorated


def get_current_user_id() -> str:
    """Access the authenticated user ID from Flask context."""
    if hasattr(g, "current_user_id") and g.current_user_id:
        return g.current_user_id
    if hasattr(g, "current_user") and g.current_user:
        return g.current_user.id
    raise AuthError("No authenticated user in current context", 401)
