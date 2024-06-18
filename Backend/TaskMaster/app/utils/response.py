# response.py

def success_response(data=None, message="Success", status_code=200):
    response = {
        "status": "success",
        "message": message,
        "data": data
    }
    return response, status_code

def error_response(message="An error occurred", status_code=500):
    response = {
        "status": "error",
        "message": message,
        "data": None
    }
    return response, status_code
