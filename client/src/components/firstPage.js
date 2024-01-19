import React, { useState, useEffect } from 'react';
import './firstPage.css'; // Import your CSS file here
import { useCookies } from 'react-cookie'; // Import useCookies
import { BiSolidSend } from 'react-icons/bi'; // Import the Font Awesome Arrow Right icon
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { QuestionProvider, useQuestion } from './QuestionContext';
import LoadingPage from "./LoadingPage"

function FirstPage() {
  const [cookies] = useCookies(['user_data']); // Get the user_data cookie

  const [isLoading, setIsLoading] = useState(true);

  const [questions, setQuestions] = useState([]);

  // Retrieve the student's name from the cookie or provide a default value
  const studentName = cookies.user_data ? cookies.user_data.fullName : 'Student';
  
  const { setQuestion } = useQuestion();

  const [isOldUser, setIsOldUser] = useState(null);

  const handleTopicClick = (topic) => {
    setQuestion(topic);
  };

  useEffect(() => {
    
    fetch('http://Routing_page/question_prediction_route', {
    method: 'POST',  
    headers: {
        'User-Email': cookies.user_data.email,
      },
    })
      .then(response => response.json())
      .then(data => {
        setQuestions(data);
        console.log(data);
        const cleanedQuestions = data.map((tempqs) => tempqs.replace(/"/g, ''));
        setQuestions(cleanedQuestions);
        console.log(cleanedQuestions);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      })
  }, [setIsOldUser]);

  // useEffect(() => {
  //   // Display loading for 2 seconds when isLoading is true
  //   if (isLoading) {
  //     const loadingTimeout = setTimeout(() => {
  //       setIsLoading(false); // Set isLoading to false after 2 seconds
  //     }, 2000);

  //     // Clear the timeout if the component unmounts or isLoading becomes false
  //     return () => clearTimeout(loadingTimeout);
  //   }
  // }, [isLoading]);

  useEffect(() => {
    // Perform the fetch when the component mounts
    fetch('http://Routing_page/check_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Assuming you have the student's email in cookies.user_data.email
        'User-Email': cookies.user_data ? cookies.user_data.email : '',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsOldUser(data === 1); // Assuming 1 means an old user, 0 means a new user
        if( !isOldUser )
        {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching user status:', error);
        setIsOldUser(false); // Set to false to handle errors
      });
  }, [cookies.user_data]); // Fetch again when user_data changes

  return (
    <QuestionProvider>
      {isLoading ? (
        <LoadingPage /> // Render the LoadingPage component while isLoading is true
      ) : (
    <div className="first-page">
      {/* Left side (Bot image) */}
      <div className="left-side"></div>

      {/* Right side (Dialogue box) */}
      <div className="right-side">
        <div className="dialogue-box">
          <p>Hello {studentName},</p>
          {isOldUser ? (
            <>
          <p>
            I am glad to meet you again. Please feel free to ask any questions you have
            about the course, its lecture notes, or textbook content. You can
            upload them before asking your questions.
          </p>
          <div>
        {/* <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
          What is meteorology?
          <div className='send-buttons'>
          <BiSolidSend />
          </div>
        </Link>
        <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
          How does PTB get its answers?
          <div className='send-buttons'>
          <BiSolidSend />
          </div>
        </Link>
        <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
          What is global warming?
          <div className='send-buttons'>
          <BiSolidSend />
          </div>
        </Link>
        <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
          What are greenhouse gases?
          <div className='send-buttons'>
          <BiSolidSend />
          </div>
        </Link> */}
        {questions.map((question, index) => (
              <Link
                key={index}
                to="/chat"
                className="custom-button"
                onClick={() => handleTopicClick(question)}
              >
                {question}
                <div className="send-buttons">
                  <BiSolidSend />
                </div>
              </Link>
            ))}
        </div>
        {/* <div className="revision-header">
            <h2>Revision Topics</h2>
            <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
              Global Warming
              <BiSolidSend className="send-icon" />
            </Link>
            <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
              Meteorology
              <BiSolidSend className="send-icon" />
            </Link>
            <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
              Artificial Intelligence
              <BiSolidSend className="send-icon" />
            </Link>
            <Link to="/chat" className="custom-button" onClick={() => handleTopicClick('what is Global Warming?')}>
              Greenhouse Gases
              <BiSolidSend className="send-icon" />
            </Link>
          </div> */}
          </>
        ) : (
            <p>Welcome to PTB!, let's get you started, you can upload your lecture notes, the bot supports a lot of file extensions and you can ask questions based on the content in the files.</p>
        )}
        </div>
        <div className="chat-button-container">
        <Link to='/chat' className="chat-button">Chat Page</Link>
        <div className="filler">
      </div>
        </div>
      </div>
    </div>
    )}
    </QuestionProvider>
  );
}

export default FirstPage;
