from .health_check import api_bp
from .user import user_bp
from .task import task_routes
def init_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(task_routes, url_prefix='/task')
