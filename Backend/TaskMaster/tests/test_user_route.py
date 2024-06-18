import pytest
import pytest_asyncio
from quart import Quart
from quart.testing import QuartClient
from app import create_app
from app.utils.mongo_db_wrapper import get_db
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

@pytest_asyncio.fixture
async def app() -> Quart:
    app = await create_app()
    app.config['TESTING'] = True

    async with app.app_context():
        yield app

@pytest_asyncio.fixture
async def client(app: Quart) -> QuartClient:
    return app.test_client()

@pytest_asyncio.fixture(autouse=True)
async def setup_db(app: Quart):
    async with app.app_context():
        db = await get_db()
        master_db = await db.get_master_db()
        await master_db.users.delete_many({})  # Clear users collection before each test

@pytest.mark.asyncio
async def test_register(client: QuartClient):
    response = await client.post('/user/register', json={
        'fullName': 'Test User',
        'phoneNumber': '1234567890',
        'email': 'test@example.com',
        'password': 'password123',
    })
    assert response.status_code == 200
    data = await response.get_json()
    assert data['status'] == 'success'
    assert 'access_token' in data['data']
    assert 'refresh_token' in data['data']
    assert 'user' in data['data']

@pytest.mark.asyncio
async def test_login(client: QuartClient):
    await client.post('/user/register', json={
        'fullName': 'Test User',
        'phoneNumber': '1234567890',
        'email': 'test@example.com',
        'password': 'password123',
    })
    response = await client.post('/user/login', json={
        'email': 'test@example.com',
        'password': 'password123',
    })
    assert response.status_code == 200
    data = await response.get_json()
    assert data['status'] == 'success'
    assert 'access_token' in data['data']
    assert 'refresh_token' in data['data']
    assert 'user' in data['data']

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: QuartClient):
    await client.post('/user/register', json={
        'fullName': 'Test User',
        'phoneNumber': '1234567890',
        'email': 'test@example.com',
        'password': 'password123',
    })
    response = await client.post('/user/login', json={
        'email': 'test@example.com',
        'password': 'wrongpassword',
    })
    assert response.status_code == 400  # Should return 400 for invalid credentials
    data = await response.get_json()
    assert data['status'] == 'error'
    assert data['message'] == 'Invalid email or password'

@pytest.mark.asyncio
async def test_forgot_password(client: QuartClient):
    await client.post('/user/register', json={
        'fullName': 'Test User',
        'phoneNumber': '1234567890',
        'email': 'test@example.com',
        'password': 'password123',
    })
    response = await client.post('/user/forgot-password', json={
        'email': 'test@example.com',
    })
    assert response.status_code == 200
    data = await response.get_json()
    assert data['status'] == 'success'
    assert data['message'] == 'Password reset email sent'

@pytest.mark.asyncio
async def test_reset_password(client: QuartClient):
    await client.post('/user/register', json={
        'fullName': 'Test User',
        'phoneNumber': '1234567890',
        'email': 'test@example.com',
        'password': 'password123',
    })
    response = await client.post('/user/reset-password', json={
        'email': 'test@example.com',
        'new_password': 'newpassword123',
    })
    assert response.status_code == 200
    data = await response.get_json()
    assert data['status'] == 'success'
    assert data['message'] == 'Password reset successfully'

@pytest.mark.asyncio
async def test_update_profile(client: QuartClient):
    register_response = await client.post('/user/register', json={
        'fullName': 'Test User',
        'phoneNumber': '1234567890',
        'email': 'test@example.com',
        'password': 'password123',
    })
    user = (await register_response.get_json())['data']['user']
    response = await client.post('/user/update-profile', form={
        'user_id': user['user_id'],
        'profile_picture_path': '/path/to/picture',
        'bio': 'This is a bio',
        'theme': 'dark',
    })
    assert response.status_code == 200
    data = await response.get_json()
    assert data['status'] == 'success'
    assert data['message'] == 'Profile updated successfully'
