from fastapi import HTTPException
from utils import common_dependencies


def update_chat_history(
    user_id: str, user_message: str, assistant_answer: str
):
    commons = common_dependencies()
    response= (
        commons["supabase"]
        .table("chat_history")
        .insert(
            {
                "user_id": str(user_id),
                "user_message": user_message,
                "assistant": assistant_answer,
            }
        )
        .execute()
    ).data
    if len(response) == 0:
        raise HTTPException(
            status_code=500, detail="An exception occurred while updating chat history."
        )
    return response[0]