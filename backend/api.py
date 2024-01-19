import os
import shutil
import time
from tempfile import SpooledTemporaryFile
from uuid import UUID
import pypandoc
from crawl.crawler import CrawlWebsite
from fastapi import Depends, FastAPI, UploadFile, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from llm.summarization import llm_evaluate_summaries
from logger import get_logger
from parsers.audio import process_audio
from parsers.common import file_already_exists
from parsers.csv import process_csv
from parsers.docx import process_docx
from parsers.epub import process_epub
from parsers.html import process_html
from parsers.markdown import process_markdown
from parsers.notebook import process_ipnyb
from parsers.odt import process_odt
from parsers.pdf import process_pdf
from parsers.powerpoint import process_powerpoint
from parsers.txt import process_txt
from parsers.xlsx import process_xlsx
from pydantic import BaseModel, Field
from supabase import Client
from utils import (ChatMessage, CommonsDep, convert_bytes, create_user,
                   get_file_size, similarity_search, update_user_request_count)
from llm.brainpicking import BrainPicking
from llm.BrainPickingOpenAIFunctions.BrainPickingOpenAIFunctions import (
    BrainPickingOpenAIFunctions
)
from llm.BrainPickingOpenAIFunctions.QuizGeneration import (
    QuizGeneration)
import json
from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
 
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from thought_predict import thought, think_user_prediction
from typing import List
import re
 
from fastapi import Header
from prediction import question_prediction
from chat_history import update_chat_history

logger = get_logger(__name__)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://Routing_page:3000",
    "http://Routing_page",
    "http://Routing_page/*",
    "http://Routing_page:3000/*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
global_email = None


@app.on_event("startup")
async def startup_event():
    pypandoc.download_pandoc()


file_processors = {
    ".txt": process_txt,
    ".csv": process_csv,
    ".md": process_markdown,
    ".markdown": process_markdown,
    ".m4a": process_audio,
    ".mp3": process_audio,
    ".webm": process_audio,
    ".mp4": process_audio,
    ".mpga": process_audio,
    ".wav": process_audio,
    ".mpeg": process_audio,
    ".pdf": process_pdf,
    ".html": process_html,
    ".pptx": process_powerpoint,
    ".docx": process_docx,
    ".odt": process_odt,
    ".epub": process_epub,
    ".ipynb": process_ipnyb,
    ".xlsx": process_xlsx,
}


class User (BaseModel):
    email: str


async def filter_file(file: UploadFile, enable_summarization: bool, supabase_client: Client, user: User):
    if await file_already_exists(supabase_client, file, user):
        return {"message": f"🤔 {file.filename} already exists.", "type": "warning"}
    elif file.file._file.tell()  < 1:
        return {"message": f"❌ {file.filename} is empty.", "type": "error"}
    else:
        file_extension = os.path.splitext(file.filename)[-1].lower()  # Convert file extension to lowercase
        if file_extension in file_processors:
            await file_processors[file_extension](file, enable_summarization, user)
            return {"message": f"✅ {file.filename} has been uploaded.", "type": "success"}
        else:
            return {"message": f"❌ {file.filename} is not supported.", "type": "error"}


async def background_process(commons, user_email, question, history):
    prediction_questions = await thought(question, history)
    next_pred = await think_user_prediction(history)
    logger.info(prediction_questions)
    logger.info(next_pred)

    response= (
        commons["supabase"]
        .table("prediction")
        .insert(
            {
                "user_id": str(user_email),
                "thoughts": prediction_questions,
                "question_prediction": next_pred,
            }
        )
        .execute()
    ).data
    if len(response) == 0:
        raise HTTPException(
            status_code=500, detail="An exception occurred while updating chat history."
        )



@app.post("/upload")
async def upload_file(commons: CommonsDep, file: UploadFile, enable_summarization: bool = False,user_email: str = Header(None)):
    if user_email is None:
        return {"message": "User email not provided"}
    user = User(email=user_email)
    user_vectors_response = commons['supabase'].table("vectors").select(
        "name:metadata->>file_name, size:metadata->>file_size", count="exact") \
            .filter("user_id", "eq", user.email)\
            .execute()
    documents = user_vectors_response.data 
    logger.info("Successfully Access the data from the response")
    message = await filter_file(file, enable_summarization, commons['supabase'], user)
    return message


@app.post("/chat/")
async def chat_endpoint(commons: CommonsDep, background_tasks: BackgroundTasks, chat_message: ChatMessage,user_email: str = Header(None)):

    user = User(email=user_email)
    
    logger.info(f"Email: {user.email}")
    user_openai_api_key = os.environ.get("OPENAI_API_KEY")
    history = chat_message.history
    if len(history)==0:
        welcome_msg=f"Hi {user.email} welcome to PTB."
        history.append(("assistant",welcome_msg))

    # history.append(("user", chat_message.question))
    # background_tasks.add_task(background_process, commons, user_email, chat_message.question, history)
    
    gpt_answer_generator = BrainPickingOpenAIFunctions(
                model=chat_message.model,
                chat_id=str(history),
                temperature=chat_message.temperature,
                max_tokens=chat_message.max_tokens,
                user_email=user.email,
                user_openai_api_key=user_openai_api_key,
            )
    logger.info(chat_message.question)
    answer = gpt_answer_generator.generate_answer(chat_message.question)
    history.append(("user", chat_message.question))
    history.append(("assistant", answer))

    background_tasks.add_task(background_process, commons, user_email, chat_message.question, history)

    chat_history = update_chat_history(
            user_id=user.email,
            user_message=chat_message.question,
            assistant_answer=answer,
        )

    response = commons['supabase'].table("users").select("requests_count").filter("user_id", "eq", user.email).execute()
    
    if not response.data:
        response = commons['supabase'].table("users").insert({"user_id": user.email, "requests_count": 0}).execute()

    user_data =  response.data
    current_count = user_data[0]['requests_count']
    new_count = current_count + 1
    result = commons['supabase'].table("users").update({"requests_count": new_count}).filter("user_id", "eq", user.email).execute()
    
    return {"history": history}


@app.post("/check_user")
async def check_new_user(commons: CommonsDep,user_email: str = Header(None)):
    user = User(email = user_email)
    response = commons['supabase'].table("users").select("requests_count", count="exact").filter("user_id", "eq", user.email).execute()
    if not response.data:
        return 0

    return 1

@app.post("/prediction-thought")
async def thought_prediction(commons: CommonsDep, user_email: str = Header(None)):
    user = User(email = user_email)
    response = commons['supabase'].table("prediction").select("thoughts","question_prediction").filter("user_id", "eq", user.email).order("message_time", desc=True).limit(1).execute()
    logger.info(response.data)
    if not response.data:
        return "Loading"
    
    return {"prediction": response.data}


@app.post("/question_prediction_route")
async def question_prediction_endpoint(commons: CommonsDep,user_email: str = Header(None)):
    user = User(email = user_email)
    
    result = commons['supabase'].table("chat_history").select("user_message").filter("user_id", "eq", user.email).order("message_time", desc=True).execute()
    prediction_questions =  await question_prediction(result.data)
    logger.info(prediction_questions)
    return prediction_questions

@app.get("/explore")
async def explore_endpoint(commons: CommonsDep,user_email: str = Header(None)):
    user = User(email=user_email)
    response = commons['supabase'].table("vectors").select(
        "name:metadata->>file_name, size:metadata->>file_size", count="exact").filter("user_id", "eq", user.email).execute()
    documents = response.data  # Access the data from the response
    # Convert each dictionary to a tuple of items, then to a set to remove duplicates, and then back to a dictionary
    unique_data = [dict(t) for t in set(tuple(d.items()) for d in documents)]
    # Sort the list of documents by size in decreasing order
    unique_data.sort(key=lambda x: int(x['size']), reverse=True)

    return {"documents": unique_data}


@app.delete("/explore/{file_name}")
async def delete_endpoint(commons: CommonsDep, file_name: str, user_email: str = Header(None)):
    user = User(email=user_email)
    logger.info(f"Deleting file: {file_name}")
    # Cascade delete the summary from the database first, because it has a foreign key constraint
    commons['supabase'].table("summaries").delete().match(
        {"metadata->>file_name": file_name}).execute()
    commons['supabase'].table("vectors").delete().match(
        {"metadata->>file_name": file_name, "user_id": user.email}).execute()
    return {"message": f"{file_name} of user {user.email} has been deleted."}


@app.get("/explore/{file_name}")
async def download_endpoint(commons: CommonsDep, file_name: str, user_email: str = Header(None)):
    user = User(email=user_email)
    response = commons['supabase'].table("vectors").select(
        "metadata->>file_name, metadata->>file_size, metadata->>file_extension, metadata->>file_url").match({"metadata->>file_name": file_name, "user_id": user.email}).execute()
    documents = response.data
    # Returns all documents with the same file name
    return {"documents": documents}


@app.post("/quiz/{file_name}")
async def quiz(commons: CommonsDep, file_name: str, user_email: str = Header(None)):
    user = User(email=user_email)
    file_data = commons['supabase'].table("vectors").select("content").match({"metadata->>file_name": file_name, "user_id": user.email}).execute()
    combined_content = ' '.join(item['content'] for item in file_data.data)

    class Quizgen(BaseModel):
        question: str = Field(description="Multiple choice questions generated from input text snippet.")
        options: List[str] = Field(description="Possible 4 choices of the multiple choice question.")
        answer: str= Field(description="Correct answer for question.")

    output_parser = PydanticOutputParser(pydantic_object=Quizgen)

    chat_model = ChatOpenAI(temperature=0, model_name='gpt-3.5-turbo-16k')
    prompt = PromptTemplate(
    template="Given a text input from the user, generate 5 multiple choice questions along with the correct answer.\n{format_instructions}\n{user_prompt}",
    input_variables=["user_prompt"],
    partial_variables={"format_instructions": output_parser.get_format_instructions()},
)
    
    user_query = prompt.format_prompt(user_prompt = combined_content)
    user_query_output = chat_model(user_query.to_messages())
    markdown_text = user_query_output.content
    
    questions = re.findall(r'\{[^}]+\}', markdown_text)
    output_string = ','.join(questions)
    logger.info(output_string)
    question_list = json.loads(str(f'[{output_string}]'))

    return {"data":question_list}


@app.get("/")
async def root():
    return {"message": "Hello World"}
