from pymongo import MongoClient
from pymongo.server_api import ServerApi

from app.config import settings


client = MongoClient(
    settings.mongodb_url,
    server_api=ServerApi(
        version="1",
        strict=True,
        deprecation_errors=True,
    ),
)

database = client[settings.mongodb_database]

users_collection = database["users"]
documents_collection = database["documents"]


def connect_to_database():
    client.admin.command("ping")
    print("MongoDB Atlas connection successful.")


def close_database_connection():
    client.close()