import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_classic.memory import ConversationBufferMemory

load_dotenv()

def get_llm():
    model_name = os.getenv("GROQ_MODEL")
    if not model_name:
        raise ValueError("GROQ_MODEL is not set. Configure it to an active Groq model name.")
    return ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model_name=model_name
    )

memory = ConversationBufferMemory(return_messages=True)

def get_memory():
    return memory