from typing import Any, Dict, List, Optional

from langchain.chat_models import ChatOpenAI
# from llm.quizpick import QuizPick
from llm.brainpicking import BrainPicking
from logger import get_logger
# from repository.chat.get_chat_history import get_chat_history
from vectorstore.supabase import CustomSupabaseVectorStore

from .utils.format_answer import format_answer

logger = get_logger(__name__)


class QuizGeneration(BrainPicking):
    DEFAULT_MODEL = "gpt-3.5-turbo-16k"
    DEFAULT_TEMPERATURE = 0.0
    DEFAULT_MAX_TOKENS = 256

    openai_client: ChatOpenAI = None
    user_email: str = None

    def __init__(
        self,
        model: str,
        # chat_id: str,
        temperature: float,
        max_tokens: int,
        user_email: str,
        user_openai_api_key: str,
    ) -> None:
        # Call the constructor of the parent class (BrainPicking)
        super().__init__(
            model="gpt-3.5-turbo-16k",
            user_id=user_email,
            # chat_id=chat_id,
            max_tokens=max_tokens,
            user_openai_api_key=user_openai_api_key,
            temperature=temperature,
        )
        self.openai_client = ChatOpenAI(openai_api_key=self.settings.openai_api_key)
        self.user_email = user_email

    def _get_model_response(
        self,
        messages: List[Dict[str, str]],
        functions: Optional[List[Dict[str, Any]]] = None,
    ) -> Any:
        """
        Retrieve a model response given messages and functions
        """
        logger.info("Getting model response")
        # logger.info(f"Model name {self.llm_name} type {type(self.llm_name)}")
        kwargs = {
            "messages": messages,
            "model": self.llm_name,
            "temperature": self.temperature,
            "max_tokens": 10000,
        }

        if functions:
            logger.info("Adding functions to model response")
            kwargs["functions"] = functions

        return self.openai_client.completion_with_retry(**kwargs)


    def _get_context(self, question: str) -> str:
        """
        Retrieve documents related to the question
        """
        logger.info("Getting context")
        vector_store = CustomSupabaseVectorStore(
            self.supabase_client,
            self.embeddings,
            table_name="match_vectors",
            user_id=self.user_email,
        )

        return vector_store.similarity_search(query=question, user_id=self.user_email)

    def _construct_prompt(
        self, question: str, useContext: bool = False, useHistory: bool = False
    ) -> List[Dict[str, str]]:
        """
        Constructs a prompt given a question, and optionally include context and history
        """
        logger.info("Constructing prompt")
        system_messages = [
            {
                "role": "system",
                "content": """Generate 5 MCQs suitable for college students on the important points exclusively from the provided file content. Do not use any information from external sources or imagination. 
                Each question should have four answer choices, and only one choice should be correct. Ensure that the questions are distinct, meaningful and relevant to the file content.
                Return th MCQs in JSON format.
                In this JSON structure, each MCQ is represented as an object with three properties:
                "question": The text of the question.
                "options": A dictionary of strings representing the answer options.
                "correctAnswer": This field contains the text of the correct answer
         
                """

            }
        ]


        if useContext:
            logger.info("Adding chat context to prompt")
            chat_context = self._get_context(question)
            context_message = f"Here is chat context: {chat_context if chat_context else 'No document found'}"
            system_messages.append({"role": "user", "content": context_message})

        system_messages.append({"role": "user", "content": question})

        return system_messages

    def generate_answer(self, question: str) -> str:
        """
        Main function to get an answer for the given question
        """
        logger.info("Getting answer")
        functions = [
            {
                "name": "get_history",
                "description": "Used to get the chat history between the user and the assistant",
                "parameters": {"type": "object", "properties": {}},
            },
            {
                "name": "get_context",
                "description": "Used for retrieving documents related to the question to help answer the question",
                "parameters": {"type": "object", "properties": {}},
            },
            {
                "name": "get_history_and_context",
                "description": "Used for retrieving documents related to the question to help answer the question and the previous chat history",
                "parameters": {"type": "object", "properties": {}},
            },
        ]

        # First, try to get an answer using just the question
        response = self._get_model_response(
            messages=self._construct_prompt(question), functions=functions
        )
        formatted_response = format_answer(response)

        # If the model calls for history, try again with history included
        if (
            formatted_response.function_call
            and formatted_response.function_call.name == "get_history"
        ):
            logger.info("Model called for history")
            response = self._get_model_response(
                messages=self._construct_prompt(question, useHistory=True),
                functions=[],
            )

            formatted_response = format_answer(response)

        # If the model calls for context, try again with context included
        if (
            formatted_response.function_call
            and formatted_response.function_call.name == "get_context"
        ):
            logger.info("Model called for context")
            response = self._get_model_response(
                messages=self._construct_prompt(
                    question, useContext=True, useHistory=False
                ),
                functions=[],
            )
            formatted_response = format_answer(response)

        if (
            formatted_response.function_call
            and formatted_response.function_call.name == "get_history_and_context"
        ):
            logger.info("Model called for history and context")
            response = self._get_model_response(
                messages=self._construct_prompt(
                    question, useContext=True, useHistory=True
                ),
                functions=[],
            )
            formatted_response = format_answer(response)

        return formatted_response.content or ""
