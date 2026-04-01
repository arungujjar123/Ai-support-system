from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

def retrieve_context(query: str):
    loader = TextLoader("data/sample.txt")
    documents = loader.load()

    splitter = CharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    docs = splitter.split_documents(documents)

    # simple retrieval (no vector DB yet)
    for doc in docs:
        if query.lower() in doc.page_content.lower():
            return doc.page_content

    return "No relevant context found"