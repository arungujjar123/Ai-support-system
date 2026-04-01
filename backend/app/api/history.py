from fastapi import APIRouter
from app.db import chats_collection

router = APIRouter()

# GET chats
@router.get("/chats")
def get_chats():
    chats = list(chats_collection.find({}, {"_id": 0}))
    return chats


# SAVE chat
@router.post("/save-chat")
def save_chat(chat: dict):
    existing = chats_collection.find_one({"id": chat["id"]})

    if existing:
        chats_collection.update_one(
            {"id": chat["id"]},
            {"$set": chat}
        )
    else:
        chats_collection.insert_one(chat)

    return {"message": "Chat saved"}