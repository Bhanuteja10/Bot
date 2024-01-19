import os
from langchain.chat_models import ChatOpenAI, AzureChatOpenAI
from langchain.prompts import (
    SystemMessagePromptTemplate,
)
from langchain.prompts import load_prompt, ChatPromptTemplate
from langchain.schema import AIMessage, HumanMessage, BaseMessage

async def thought(message,history):

    human_messages = [('human', message) for role, message in history if role == 'user']


    # print(assistant_tuple)

    SYSTEM_THOUGHT = '''
        You are PTB, a subversive-minded learning companion. Your job is to employ your theory of mind skills to predict the user’s mental state.

        Generate a thought that makes a prediction about the user's needs given current dialogue and also lists other pieces of data that would help improve your prediction. Use markdown or other techniques to present the content in a clear and organized manner.
    '''

    system_thought: SystemMessagePromptTemplate = SystemMessagePromptTemplate.from_template(SYSTEM_THOUGHT)
    llm = ChatOpenAI(model_name = "gpt-4", temperature=1.2, model_kwargs={"top_p": 0.5}, openai_api_key=os.environ.get("OPENAI_API_KEY"))
    
    thought_prompt = ChatPromptTemplate.from_messages([
        system_thought,
        human_messages[0],
        HumanMessage(content=message)
    ])
    thought = llm(thought_prompt.format_prompt().to_messages())
   
    return thought.content

async def think_user_prediction(history):
    llm = ChatOpenAI(model_name = "gpt-4", temperature=1.2, model_kwargs={"top_p": 0.5}, openai_api_key=os.environ.get("OPENAI_API_KEY"))
    
    SYSTEM_USER_PREDICTION_THOUGHT = '''
    Generate a "thought" that makes a prediction about what the user will say based on the way the conversation has been going.

        History: ```

        {history}

        ```

        thought:
    '''
    system_user_prediction_thought: SystemMessagePromptTemplate = SystemMessagePromptTemplate.from_template(SYSTEM_USER_PREDICTION_THOUGHT)
    user_prediction_thought_prompt = ChatPromptTemplate.from_messages([
                system_user_prediction_thought,
                
            ])
    user_prediction_thought = llm(user_prediction_thought_prompt.format_prompt(history = history).to_messages())
  
    return user_prediction_thought.content