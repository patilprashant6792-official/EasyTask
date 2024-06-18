import datetime
import uuid

class Task:
    def __init__(self, title, description, status, remind_at, sequence):
        self.task_id = str(uuid.uuid4())
        self.title = title
        self.description = description
        self.status = status
        self.remind_at = remind_at
        self.sequence = sequence
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()
        self.is_deleted = False

    def to_dict(self):
        return {
            "task_id": self.task_id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "remind_at": self.remind_at,
            "sequence": self.sequence,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_deleted": self.is_deleted
        }
