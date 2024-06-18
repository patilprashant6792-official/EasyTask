import asyncio
from quart import Quart, g, request, jsonify
from quart_cors import cors
from app.config import Config
from app.api import init_routes
from app.utils.logger import app_logger
from asgi_correlation_id import CorrelationIdMiddleware
from app.utils.response import error_response
from app.utils.mongo_db_wrapper import init_mongo
async def create_app():
    app = Quart(__name__)
    app = cors(app, allow_origin="*")
    app.config.from_object(Config)

    # Add CorrelationIdMiddleware
    app.asgi_app = CorrelationIdMiddleware(app.asgi_app)

    @app.before_request
    async def before_request():
        g.correlation_id = request.headers.get('X-Correlation-ID', None)

    @app.errorhandler(Exception)
    async def handle_exception(e):
        app_logger.log_error(f"Unhandled exception: {str(e)}")
        return error_response(message=str(e), status_code=500)

    init_mongo(app)
    init_routes(app)

    return app

__all__ = ['create_app']
