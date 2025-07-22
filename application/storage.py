import os
import json
import platform
import hashlib
import base64
import hmac
from cryptography.fernet import Fernet, InvalidToken

class Storage:
    """A class to securely store and retrieve data using encryption."""
    def __init__(self, appname: str):
        self.appname = appname
        self.filepath = self._get_storage_path()

    def _get_storage_path(self):
        folder = os.path.expanduser(f"~/.{self.appname}")
        os.makedirs(folder, exist_ok=True)
        return os.path.join(folder, "secure_data.dat")

    def _get_machine_fingerprint(self):
        info = platform.node() + platform.system() + platform.processor()
        return hashlib.sha256(info.encode()).digest()

    def _derive_key(self):
        return base64.urlsafe_b64encode(self._get_machine_fingerprint()[:32])

    def _derive_hmac_key(self):
        return self._get_machine_fingerprint()

    def add_data(self, data: dict):
        """Encrypt and store data securely."""
        key = self._derive_key()
        fernet = Fernet(key)
        json_data = json.dumps(data)
        encrypted = fernet.encrypt(json_data.encode())

        hmac_key = self._derive_hmac_key()
        hash_digest = hmac.new(hmac_key, encrypted, hashlib.sha256).digest()

        with open(self.filepath, "wb") as f:
            f.write(len(encrypted).to_bytes(2, 'big'))
            f.write(encrypted)
            f.write(hash_digest)

    def get_data(self) -> dict | None:
        """Decrypt and retrieve stored data."""
        if not os.path.exists(self.filepath):
            return None

        try:
            with open(self.filepath, "rb") as f:
                length = int.from_bytes(f.read(2), 'big')
                encrypted = f.read(length)
                stored_hash = f.read()

            hmac_key = self._derive_hmac_key()
            actual_hash = hmac.new(hmac_key, encrypted, hashlib.sha256).digest()

            if not hmac.compare_digest(stored_hash, actual_hash):
                raise Exception("Tampering detected")

            fernet = Fernet(self._derive_key())
            decrypted = fernet.decrypt(encrypted).decode()
            return json.loads(decrypted)

        except (InvalidToken, Exception) as e:
            raise Exception(f"[-] Error loading data: {e}")
