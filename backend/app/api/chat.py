from fastapi import APIRouter
from app.agents.classifier import classify_query
from app.services.actions import handle_refund, handle_order_status
from app.services.llm import get_llm, get_memory
from app.utils.rag import retrieve_context

router = APIRouter()

@router.post("/chat")
def chat(data: dict):
    user_msg = data["message"]

    memory = get_memory()
    history = memory.load_memory_variables({}).get("history", "")

    category = classify_query(user_msg)

    if category == "refund":
        action_response = handle_refund()

    elif category == "order_status":
        action_response = handle_order_status()

    else:
        context = retrieve_context(user_msg)
        llm = get_llm()

        prompt = f"""
        Conversation history:
        {history}

        Context:
        {context}

        Question: {user_msg}
        """

        response = llm.invoke(prompt)
        action_response = response.content

    # save memory
    memory.save_context(
        {"input": user_msg},
        {"output": action_response}
    )

    return {
        "response": action_response,
        "category": category
    }