import logging
from loguru import logger
from asgi_correlation_id import correlation_id
from quart import Quart,g,request

logger.add(
    "app.log",
    format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {module}:{function}:{line} | [Correlation ID: {extra[correlation_id]}] | {message}",
    serialize=True
)

class app_logger:
    @staticmethod
    def log_info(message):
        correlation = getattr(g, 'correlation_id', None)
        logger.bind(correlation_id=correlation).info(message)

    @staticmethod
    def log_error(message):
        correlation = getattr(g, 'correlation_id', None)
        logger.bind(correlation_id=correlation).error(message)

    @staticmethod
    def log_warning(message):
        correlation = getattr(g, 'correlation_id', None)
        logger.bind(correlation_id=correlation).warning(message)