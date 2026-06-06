import hashlib
import os
from datetime import datetime, timedelta, timezone
import jwt
from app.config import settings

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}:{hashed.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_hex, hashed_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        hashed = bytes.fromhex(hashed_hex)
        new_hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return new_hashed == hashed
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return decoded
    except jwt.PyJWTError:
        return None
