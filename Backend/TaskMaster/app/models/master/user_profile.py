import datetime
import uuid

from typing import Optional, Dict

class UserProfile:
    def __init__(self,user_id, profile_picture_url: Optional[str] = None, bio: Optional[str] = None, theme: str = "light"):
        self.user_id = user_id
        self.profile_picture_data = profile_picture_url
        self.bio = bio
        self.theme = theme
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "profile_picture_data": self.profile_picture_data,
            "bio": self.bio,
            "theme": self.theme,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
