import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_MASTER_DB = os.getenv("MONGO_MASTER_DB", "CodeCraft002")
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")
