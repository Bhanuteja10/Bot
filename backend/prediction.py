from langchain.prompts import PromptTemplate
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from logger import get_logger
from langchain.chat_models import ChatOpenAI
from utils import CommonsDep
import json, os

logger = get_logger(__name__)

async def question_prediction(data: list):
  
  llm = ChatOpenAI(model_name = "gpt-4", temperature=1.2, model_kwargs={"top_p": 0.5},  openai_api_key=os.environ.get("OPENAI_API_KEY"))
  numbered_messages = {}
  for index, item in enumerate(data, 1):
    numbered_messages[f"Message {index}"] = item['user_message']

  logger.info(numbered_messages)
      
  history = f'''
  {numbered_messages}
  '''
  template = '''

  Given the user's chat history with a chatbot, predict 4 potential questions the user might ask next. Use the following guidelines:

  1. **Ignore Casual Greetings:** Disregard messages like 'Hi', 'Hello', 'How are you?', etc.
  2. **Prioritize Recent Interactions:** Questions should be more relevant to the most recent parts of the conversation. In the list, 'Message 1' represents the most recent question asked by the user, 'Message 2' is the preceding one, and so forth.
  3. **Topic-Based Analysis:** Understand the recent 10 conversation and base the predictions on that topic.
  4. **Avoid Repetition:** Do not repeat any questions from the chat history. If the user has asked the same question multiple times, consider it only once.

  **User Chat History:**
  ```
  {history}
  ```
  Based on this history, what are 4 questions the user might ask next?

  ---

    '''
  
  system_message_prompt = SystemMessagePromptTemplate.from_template(template)
  chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])
  prediction = llm(chat_prompt.format_prompt(history=history).to_messages()).content

  lines = [line.strip() for line in prediction.split('\n') if line.strip()]
  questions = [line.split('. ')[1].strip("'") for line in lines]
  
  json_data = json.dumps(questions)
  logger.info(questions)
  prediction_questions = json.loads(json_data)

  return prediction_questions