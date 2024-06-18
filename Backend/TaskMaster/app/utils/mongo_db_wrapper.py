# mongo_db_wrapper.py
from motor.motor_asyncio import AsyncIOMotorClient
from quart import g, current_app

class MongoDBWrapper:
    def __init__(self, uri, master_db_name):
        self.client = AsyncIOMotorClient(uri)
        self.master_db = self.client[master_db_name]

    async def get_master_db(self):
        return self.master_db

    async def get_user_db(self, user_db_name):
        return self.client[user_db_name]

    async def close_connection(self):
        self.client.close()

async def get_db():
    if 'mongo' not in g:
        g.mongo = MongoDBWrapper(current_app.config['MONGO_URI'], current_app.config['MONGO_MASTER_DB'])
    return g.mongo

async def close_db(exception):
    mongo = g.pop('mongo', None)
    if mongo is not None:
        await mongo.close_connection()

def init_mongo(app):
    app.teardown_appcontext(close_db)
