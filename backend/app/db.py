from pymongo import MongoClient

# 👉 Local MongoDB
MONGO_URI = "mongodb+srv://Arun:Arun123@task-manager.qeceuqs.mongodb.net/"

client = MongoClient(MONGO_URI)

db = client["ai_support_db"]

chats_collection = db["chats"]