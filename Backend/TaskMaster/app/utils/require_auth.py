from functools import wraps
from quart import request, g, jsonify, current_app
import jwt
import threading
from app.utils.mongo_db_wrapper import get_db
from datetime import datetime, timedelta

def require_auth(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or 'Bearer ' not in auth_header:
            return jsonify({"error": "Authorization token is missing"}), 401

        try:
            token = auth_header.split(" ")[1]  # Assuming token is prefixed with 'Bearer '

            # Decode the token and handle possible exceptions
            try:
                user_info = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=['HS256'])
                print("User info:", user_info)  # Debugging log
            except jwt.ExpiredSignatureError:
                print("Token has expired")  # Debugging log
                return jsonify({"error": "Token has expired"}), 401
            except jwt.InvalidTokenError as e:
                print("Invalid token error:", str(e))  # Debugging log
                return jsonify({"error": str(e)}), 401

            if not hasattr(g, 'user'):
                g.user = threading.local()
            g.user.info = user_info

            db = await get_db()
            master_db = await db.get_master_db()
            user = await master_db.users.find_one({"email": user_info['email']})
            if not user:
                return jsonify({"error": "User not found"}), 404

            g.user.data = user
            g.user_db = await db.get_user_db(user["userDB_name"])
        except Exception as e:
            print("Unexpected error:", str(e))  # Debugging log
            return jsonify({"error": str(e)}), 401

        return await f(*args, **kwargs)
    return decorated_function
