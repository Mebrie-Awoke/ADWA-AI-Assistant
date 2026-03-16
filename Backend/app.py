from flask import Flask, render_template, jsonify, request
from src.helper import download_hugging_face_embeddings
from langchain_chroma import Chroma  
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from src.prompt import *
import os

load_dotenv()

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

os.environ["GROQ_API_KEY"] = GROQ_API_KEY

embeddings = download_hugging_face_embeddings()

persist_directory = "./chroma_db"  
if os.path.exists(persist_directory):
    docsearch = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )
    print("Loaded existing ChromaDB from", persist_directory)
else:
    print("No existing ChromaDB found. Please run ingestion script first.")
    docsearch = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

chatModel = ChatGroq(
    model="llama-3.3-70b-versatile",  
    temperature=0.1,
    max_tokens=1000,
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

question_answer_chain = create_stuff_documents_chain(chatModel, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)


project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app = Flask(__name__,
            template_folder=os.path.join(project_root, 'Frontend', 'templates'),
            static_folder=os.path.join(project_root, 'Frontend', 'static'))

@app.route("/")
def index():
    return render_template('chat.html')


@app.route("/get", methods=["GET", "POST"])
def chat():
    msg = request.form["msg"]
    input = msg
    print(input)
    response = rag_chain.invoke({"input": msg})
    print("Response : ", response["answer"])
    return str(response["answer"])   
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)

application = app
