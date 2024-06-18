import uvicorn
from app import create_app
import asyncio

async def main():
    app = await create_app()
    config = uvicorn.Config(app, host="0.0.0.0", port=5000, log_level="debug")
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
