import hashlib
import os


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
