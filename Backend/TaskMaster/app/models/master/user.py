import datetime
import uuid

class User:
    def __init__(self,id, full_name, phone_number, email, password, access_token=None, refresh_token=None, expires_at=None, isNew=True):
        self.user_id = id
        self.full_name = full_name
        self.phone_number = phone_number
        self.email = email
        self.password = password  # This should be a hashed password
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.expires_at = expires_at
        self.isNew = isNew
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()
        self.userDB_name = f"user_{self.user_id}"

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "full_name": self.full_name,
            "phone_number": self.phone_number,
            "email": self.email,
            "password": self.password,
            "access_token": self.access_token,
            "refresh_token": self.refresh_token,
            "expires_at": self.expires_at,
            "isNew": self.isNew,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "userDB_name": self.userDB_name
        }
