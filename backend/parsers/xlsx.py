from fastapi import UploadFile
from langchain.document_loaders import UnstructuredExcelLoader

from .common import process_file


def process_xlsx(file: UploadFile, enable_summarization, user):
    return process_file(file, UnstructuredExcelLoader, ".xlsx", enable_summarization, user)
