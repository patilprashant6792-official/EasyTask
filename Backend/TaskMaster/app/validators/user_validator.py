from app.utils.mongo_db_wrapper import get_db

async def validate_registration(data):
    required_fields = ['fullName', 'phoneNumber', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return False, f"{field} is required"
    
    # Check for duplicate email
    email = data.get('email')
    db = await get_db()
    master_db = await db.get_master_db()
    existing_user = await master_db.users.find_one({"email": email,"_id":0})
    
    if existing_user:
        return False, "Email is already in use"
    
    return True, None

async def validate_login(data):
    required_fields = ['email', 'password']
    for field in required_fields:
        if not data.get(field):
            return False, f"{field} is required"
    return True, None

async def validate_forgot_password(data):
    if not data.get('email'):
        return False, "Email is required"
    return True, None

async def validate_reset_password(data):
    required_fields = ['email', 'new_password']
    for field in required_fields:
        if not data.get(field):
            return False, f"{field} is required"
    return True, None

async def validate_update_profile(data):
    if not data.get('user_id'):
        return False, "User ID is required"
    return True, None

async def find_user_by_email(email, user_id=None):
    db = await get_db()
    master_db = await db.get_master_db()
    query = {"email": email}
    if user_id:
        query["user_id"] = {"$ne": user_id}
    existing_user = await master_db.users.find_one(query)
    return existing_user

async def validate_update_user(data, user_id):
    if not data:
        return False, "No data provided for update"
    
    # Check for duplicate email, excluding the current user
    existing_user = await find_user_by_email(data.get('email'), user_id)
    if existing_user:
        return False, "Email is already in use"
    
    required_fields = ['fullName', 'phoneNumber', 'email']
    for field in required_fields:
        if not data.get(field):
            return False, f"{field} is required"
    
    return True, None
