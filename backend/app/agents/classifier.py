from app.services.llm import get_llm

def classify_query(query: str):
    llm = get_llm()

    prompt = f"""
    Classify this query into one of these:
    - refund
    - order_status
    - general

    Query: {query}

    Answer only category name.
    """

    response = llm.invoke(prompt)
    result = response.content.lower()

    if "refund" in result:
        return "refund"
    elif "order" in result:
        return "order_status"
    else:
        return "general"