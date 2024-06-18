from quart import Blueprint, request
from app.services.task_service import TaskService
from app.utils.response import success_response, error_response
from app.utils.require_auth import require_auth
from app.validators.task_validator import validate_task_creation, validate_task_update

task_routes = Blueprint('task_routes', __name__)

@task_routes.route('/create', methods=['POST'])
@require_auth
async def create_task():
    data = await request.json

    # Validate task creation data
    is_valid, message = await validate_task_creation(data)
    if not is_valid:
        return error_response(message, 400)

    try:
        task = await TaskService.create_task(data)
        return success_response(task, "Task created successfully", 201)
    except Exception as e:
        return error_response(str(e), 500)

@task_routes.route('/<task_id>', methods=['PUT'])
@require_auth
async def update_task(task_id):
    data = await request.json

    # Validate task update data
    is_valid, message = await validate_task_update(task_id, data)
    if not is_valid:
        return error_response(message, 400)

    try:
        task = await TaskService.update_task(task_id, data)
        if task is None:
            return error_response("Task not found", 404)
        return success_response(task, "Task updated successfully")
    except Exception as e:
        return error_response(str(e), 500)

@task_routes.route('/<task_id>', methods=['DELETE'])
@require_auth
async def delete_task(task_id):
    try:
        success = await TaskService.delete_task(task_id)
        if not success:
            return error_response("Task not found", 404)
        return success_response(message="Task deleted successfully")
    except Exception as e:
        return error_response(str(e), 500)

@task_routes.route('/search', methods=['GET'])
@require_auth
async def search_tasks():
    query = request.args.get('query', '')
    try:
        tasks = await TaskService.search_tasks(query)
        return success_response(tasks, "Tasks retrieved successfully")
    except Exception as e:
        return error_response(str(e), 500)
