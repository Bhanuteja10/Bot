# Personal Tutor Bot

Welcome to the Personal Tutor Bot project! This is a web application that allows users to interact with an AI-powered personal tutor using a chat interface.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [File Upload](#file-upload)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time chat interaction with the AI tutor.
- File upload and analysis.
- Quizzes and educational resources.
- Responsive and user-friendly interface.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed on your machine.
- Python 3.x and pip installed on your machine.
- Supabase account and API keys for database interaction.
- GPT-3 API key for chat interaction.

## Getting Started

To get started with the project, you need to set up the frontend and backend components.

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Install the required dependencies: `npm install`.

### Backend Setup

1. Navigate to the `backend` directory.
2. Install the required Python packages: `pip install -r requirements.txt`.

## Installation

1. Create a `.env` file in the `backend` directory with the following content:

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_KEY
GPT3_API_KEY=YOUR_GPT3_API_KEY


Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_KEY` with your Supabase URL and key, and replace `YOUR_GPT3_API_KEY` with your GPT-3 API key.

2. Start the backend server: `python app.py`.

3. In the `frontend` directory, create a `.env` file with the following content:

REACT_APP_API_URL=http://localhost:5050


Replace the URL with the actual backend URL if it's different.

4. Start the frontend development server: `npm start`.

## Usage

Access the web application by opening your browser and navigating to `http://localhost:3000`. You can interact with the personal tutor using the chat interface, upload files for analysis, and access educational resources.

## API Endpoints

- `/chat`: POST endpoint for chat interaction with the AI tutor.
- `/upload`: POST endpoint for file upload and analysis.

## File Upload

The file upload feature allows you to analyze documents and receive insights. Supported document formats include PDF, DOC, and DOCX.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
