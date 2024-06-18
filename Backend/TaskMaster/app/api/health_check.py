from quart import jsonify, current_app, Blueprint
from app.utils.logger import app_logger
from app.utils.response import error_response, success_response

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
async def health_check():
    app_logger.log_info("health check hit")
    return jsonify(*success_response(data={"status": "healthy"})), 200

@api_bp.route('/health/mongo', methods=['GET'])
async def mongo_health_check():
    try:
        await current_app.mongo.db.command('ping')
        return success_response(data={"MongoDB connection healthy"})
    except Exception as e:
   
        return error_response(status="MongoDB connection unhealthy")
