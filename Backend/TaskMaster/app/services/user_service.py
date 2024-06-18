import datetime
import bcrypt
import jwt
from app.utils.mongo_db_wrapper import get_db
from app.models.master.user import User
from app.models.master.user_profile import UserProfile
from app.utils.logger import app_logger  # Import the logger
import uuid
from quart import current_app
from bson import ObjectId
import base64

class UserService:
    @staticmethod
    async def create_user(full_name, phone_number, email, password, isNew=True):
        db = await get_db()
        master_db = await db.get_master_db()

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Generate JWT tokens
        user_id = str(uuid.uuid4())
        access_token, refresh_token, token_expires_at = UserService.generate_tokens({
            "user_id": user_id,
            "email": email,
            "expires_at": datetime.datetime.now() + datetime.timedelta(days=7)  # Example expiration
        })

        # Create user instance with tokens
        user = User(
            id=user_id,
            full_name=full_name,
            phone_number=phone_number,
            email=email,
            password=hashed_password,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=token_expires_at,
            isNew=isNew
        )

        user_dict = user.to_dict()

        try:
            await master_db.users.insert_one(user_dict)
            app_logger.log_info(f"User created successfully: {email}")
        except Exception as e:
            app_logger.log_error(f"Failed to create user with email: {email}. Error: {e}")
            return None, None, None
        
        # Remove the '_id' and 'password' fields from the user dictionary before returning
        user_dict.pop('_id', None)
        user_dict.pop('password', None)

        # Create a separate database for the user
        try:
            await db.get_user_db(user.userDB_name)
            app_logger.log_info(f"Database created for user: {email}")
        except Exception as e:
            app_logger.log_error(f"Failed to create database for user: {email}. Error: {e}")
            return None, None, None

        # Create a user profile
        profile_picture_data = None  # Set default or placeholder picture if needed
        user_profile = UserProfile(
            user_id=user_id,
            profile_picture_url=profile_picture_data,
            bio="",
            theme="light"
        )
        user_profile_dict = user_profile.to_dict()
        
        try:
            await master_db.user_profiles.insert_one(user_profile_dict)
            app_logger.log_info(f"User profile created successfully for user: {email}")
        except Exception as e:
            app_logger.log_error(f"Failed to create user profile for user: {email}. Error: {e}")
            return None, None, None

        user_profile_dict.pop('_id', None)
        
        # Include user profile in the response
        user_dict['profile'] = user_profile_dict

        return access_token, refresh_token, user_dict

    @staticmethod
    async def verify_password(email, password):
        db = await get_db()
        master_db = await db.get_master_db()
        user = await master_db.users.find_one({"email": email}, {"_id": 0})  # Exclude the '_id' field
        
        if user:
            if bcrypt.checkpw(password.encode('utf-8'), user['password']):
                app_logger.log_info(f"Password verified for user: {email}")
                user = UserService.make_json_serializable(user)
                return user
        app_logger.log_error(f"Password verification failed for user: {email}")
        return None

    @staticmethod
    def make_json_serializable(user):
        """ Convert non-serializable fields to a JSON serializable format, except the password """
        for key, value in user.items():
            if isinstance(value, ObjectId):
                user[key] = str(value)
            elif isinstance(value, bytes) and key == 'password':
                user[key] = ''
            # Add other types if needed
        return user

    @staticmethod
    def generate_tokens(user):
        # Access token expires in 120 minutes
        access_token_payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "exp": datetime.datetime.now() + datetime.timedelta(minutes=120)
        }
        access_token = jwt.encode(access_token_payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")

        # Refresh token expires at the same time as the user account expiration
        refresh_token_payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "exp": user["expires_at"]
        }
        refresh_token = jwt.encode(refresh_token_payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")

        app_logger.log_info(f"Tokens generated for user: {user['email']}")
        return access_token, refresh_token, user["expires_at"]

    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
            app_logger.log_info(f"Token verified for user_id: {payload.get('user_id')}")
            return payload
        except jwt.ExpiredSignatureError:
            app_logger.log_error("Token expired")
            return None
        except jwt.InvalidTokenError:
            app_logger.log_error("Invalid token")
            return None

    @staticmethod
    async def login_user(email, password):
        user = await UserService.verify_password(email, password)
        if not user:
            app_logger.log_error(f"Login failed for user: {email}")
            return None, None, None

        access_token, refresh_token, _ = UserService.generate_tokens(user)

        # Fetch user profile
        db = await get_db()
        master_db = await db.get_master_db()
        user_profile = await master_db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
        user_profile_dict = user_profile if user_profile else {}

        # Include user profile in the response
        user['profile'] = user_profile_dict

        app_logger.log_info(f"User logged in successfully: {email}")
        return access_token, refresh_token, user

    @staticmethod
    async def update_user(user_id, updates):
        db = await get_db()
        master_db = await db.get_master_db()
        updates["updated_at"] = datetime.datetime.now()
        result = await master_db.users.update_one({"user_id": user_id}, {"$set": updates})
        if result.matched_count > 0:
            app_logger.log_info(f"User updated successfully: {user_id}")
            return True
        app_logger.log_error(f"Failed to update user: {user_id}")
        return False
    
    @staticmethod
    async def update_user_by_email(email, updates):
        db = await get_db()
        master_db = await db.get_master_db()
        updates["updated_at"] = datetime.datetime.now()
        result = await master_db.users.update_one({"email": email}, {"$set": updates})
        if result.matched_count > 0:
            app_logger.log_info(f"User updated successfully: {email}")
            return True
        app_logger.log_error(f"Failed to update user: {email}")
        return False

    @staticmethod
    async def get_user_by_id(user_id):
        db = await get_db()
        master_db = await db.get_master_db()
        user = await master_db.users.find_one({"user_id": user_id}, {"_id": 0})
        if user:
            app_logger.log_info(f"User retrieved successfully: {user_id}")
            return user
        app_logger.log_error(f"Failed to retrieve user: {user_id}")
        return None

    @staticmethod
    async def get_user_by_email(email):
        db = await get_db()
        master_db = await db.get_master_db()
        user = await master_db.users.find_one({"email": email}, {"_id": 0})
        if user:
            app_logger.log_info(f"User retrieved successfully: {email}")
            return user
        app_logger.log_error(f"Failed to retrieve user: {email}")
        return None

    @staticmethod
    async def get_user_db(user_db_name):
        db = await get_db()
        app_logger.log_info(f"User DB retrieved: {user_db_name}")
        return await db.get_user_db(user_db_name)

    @staticmethod
    async def update_user_profile(user_id, profile_picture_base64=None, bio=None, theme=None):
        db = await get_db()
        master_db = await db.get_master_db()

        updates = {}
        if profile_picture_base64:
            try:
                # Decode base64 string to ensure it's valid
                base64.b64decode(profile_picture_base64)
                updates["profile_picture_data"] = profile_picture_base64
            except Exception as e:
                app_logger.log_error(f"Failed to decode profile picture base64 string: {str(e)}")
                return False

        if bio is not None:
            updates["bio"] = bio
        if theme is not None:
            updates["theme"] = theme

        updates["updated_at"] = datetime.datetime.now()

        result = await master_db.user_profiles.update_one({"user_id": user_id}, {"$set": updates}, upsert=True)
        if result.matched_count > 0 or result.upserted_id:
            app_logger.log_info(f"User profile updated successfully: {user_id}")
            return True

        app_logger.log_error(f"Failed to update user profile: {user_id}")
        return False

    @staticmethod
    async def initiate_password_reset(email):
        db = await get_db()
        master_db = await db.get_master_db()
        user = await master_db.users.find_one({"email": email})

        if not user:
            app_logger.log_error(f"No user found with email: {email}")
            return False

        reset_token = jwt.encode(
            {
                "user_id": str(user["_id"]),
                "email": email,
                "exp": datetime.datetime.now() + datetime.timedelta(hours=1)
            },
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256"
        )

        # Here you would normally send the email. For now, just log it.
        app_logger.log_info(f"Password reset token for {email}: {reset_token}")

        # You might want to save the reset token to the database, 
        # or a timestamp indicating when it was generated, to invalidate old tokens.
        await master_db.password_resets.insert_one({
            "user_id": user["_id"],
            "token": reset_token,
            "created_at": datetime.datetime.now()
        })

        return True

    @staticmethod
    async def reset_password(email, new_password):
        db = await get_db()
        master_db = await db.get_master_db()
        user = await master_db.users.find_one({"email": email})

        if not user:
            app_logger.log_error(f"No user found with email: {email}")
            return False

        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        await master_db.users.update_one({"email": email}, {"$set": {"password": hashed_password}})
        
        app_logger.log_info(f"Password reset successfully for email: {email}")
        return True
    