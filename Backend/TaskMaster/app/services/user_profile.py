import base64
import datetime
import uuid
from typing import Optional, Dict
from quart import g
from app.models.master.user_profile import UserProfile


class UserProfileService:
    def __init__(self):
        self.db = g.user_db
        self.user_profiles = self.db.user_profiles

    def upsert_user_profile(self, user_id: Optional[str], profile_picture_path: Optional[str] = None, bio: Optional[str] = None, theme: str = "light") -> UserProfile:
        profile_picture_data = None
        if profile_picture_path:
            with open(profile_picture_path, "rb") as image_file:
                profile_picture_data = base64.b64encode(image_file.read()).decode('utf-8')

        if user_id:
            user_profile = self.user_profiles.find_one({"user_id": user_id})
            if user_profile:
                update_data = {}
                if profile_picture_data is not None:
                    update_data["profile_picture_data"] = profile_picture_data
                if bio is not None:
                    update_data["bio"] = bio
                update_data["theme"] = theme  # Assuming theme should always be updated if provided
                update_data["updated_at"] = datetime.datetime.now()

                self.user_profiles.update_one({"user_id": user_id}, {"$set": update_data})
                user_profile.update(update_data)
                return UserProfile(**user_profile)
            else:
                user_profile = UserProfile(profile_picture_data=profile_picture_data, bio=bio, theme=theme)
                self.user_profiles.insert_one(user_profile.to_dict())
                return user_profile
        else:
            user_profile = UserProfile(profile_picture_data=profile_picture_data, bio=bio, theme=theme)
            self.user_profiles.insert_one(user_profile.to_dict())
            return user_profile
