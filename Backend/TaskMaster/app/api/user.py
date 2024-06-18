from quart import Blueprint, request
from app.services.user_service import UserService
from app.utils.response import success_response, error_response
from app.utils.logger import app_logger  # Import the logger
from app.validators.user_validator import validate_registration, validate_login, validate_forgot_password, validate_reset_password, validate_update_profile, validate_update_user

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/register', methods=['POST'])
async def register():
    data = await request.json

    is_valid, message = await validate_registration(data)
    if not is_valid:
        app_logger.log_error(f"Registration failed: {message}")
        return error_response(message=message, status_code=400)

    full_name = data.get('fullName')
    phone_number = data.get('phoneNumber')
    email = data.get('email')
    password = data.get('password')
    isNew = data.get('isNew', True)

    try:
        access_token, refresh_token, user = await UserService.create_user(
            full_name, phone_number, email, password, isNew
        )
    except ValueError as e:
        app_logger.log_error(f"Registration failed for user: {email}, Error: {str(e)}")
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        app_logger.log_error(f"Registration failed for user: {email}, Error: {str(e)}")
        return error_response(message="Registration failed", status_code=500)

    app_logger.log_info(f"User registered successfully: {email}")
    return success_response(data={ "access_token": access_token, "refresh_token": refresh_token, "user": user }, message="User registered successfully")


@user_bp.route('/login', methods=['POST'])
async def login():
    data = await request.json

    is_valid, message = await validate_login(data)
    if not is_valid:
        app_logger.log_error(f"Login failed: {message}")
        return error_response(message=message, status_code=400)

    email = data.get('email')
    password = data.get('password')

    try:
        access_token, refresh_token, user = await UserService.login_user(email, password)
    except Exception as e:
        app_logger.log_error(f"Login failed: {str(e)}")
        return error_response(message="Invalid email or password", status_code=400)

    if access_token and refresh_token:
        app_logger.log_info(f"User logged in successfully: {email}")
        return success_response(data={"access_token": access_token, "refresh_token": refresh_token, "user": user }, message="Login successful")
    else:
        app_logger.log_error(f"Login failed: Invalid email or password for: {email}")
        return error_response(message="Invalid email or password", status_code=400)
    

@user_bp.route('/forgot-password', methods=['POST'])
async def forgot_password():
    data = await request.json

    is_valid, message = await validate_forgot_password(data)
    if not is_valid:
        app_logger.log_error(f"Forgot password failed: {message}")
        return error_response(message=message, status_code=400)

    email = data.get('email')

    success = await UserService.initiate_password_reset(email)

    if success:
        app_logger.log_info(f"Password reset email sent successfully to: {email}")
        return success_response(message="Password reset email sent")
    else:
        app_logger.log_error(f"Forgot password failed for email: {email}")
        return error_response(message="Failed to send password reset email", status_code=500)


@user_bp.route('/reset-password', methods=['POST'])
async def reset_password():
    data = await request.json

    is_valid, message = await validate_reset_password(data)
    if not is_valid:
        app_logger.log_error(f"Reset password failed: {message}")
        return error_response(message=message, status_code=400)

    email = data.get('email')
    new_password = data.get('new_password')

    success = await UserService.reset_password(email, new_password)

    if success:
        app_logger.log_info(f"Password reset successfully for email: {email}")
        return success_response(message="Password reset successfully")
    else:
        app_logger.log_error(f"Reset password failed for email: {email}")
        return error_response(message="Failed to reset password", status_code=500)


@user_bp.route('/update-profile', methods=['POST'])
async def update_profile():
    data = await request.form

    is_valid, message =await validate_update_profile(data)
    if not is_valid:
        app_logger.log_error(f"Update profile failed: {message}")
        return error_response(message=message, status_code=400)

    user_id = data.get('user_id')
    profile_picture_path = data.get('profile_picture_path')
    bio = data.get('bio')
    theme = data.get('theme')

    success = await UserService.update_user_profile(
        user_id, profile_picture_path, bio, theme
    )

    if success:
        app_logger.log_info(f"User profile updated successfully: {user_id}")
        return success_response(message="Profile updated successfully")
    else:
        app_logger.log_error(f"Update profile failed for user: {user_id}")
        return error_response(message="Failed to update profile", status_code=500)

@user_bp.route('/update-user', methods=['PUT'])
async def update_user():
    data = await request.json
    user_id = data.get('user_id')

    is_valid, message = await validate_update_user(data, user_id)
    if not is_valid:
        app_logger.log_error(f"Update user failed: {message}")
        return error_response(message=message, status_code=400)

    success = await UserService.update_user_by_email(data['email'], data)
    if success:
        app_logger.log_info(f"User updated successfully: {data['email']}")
        return success_response(message="User updated successfully")
    else:
        app_logger.log_error(f"Update user failed for email: {data['email']}")
        return error_response(message="Failed to update user",status_code=500)
