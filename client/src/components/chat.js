import React, { useState, useEffect, useRef } from 'react';
import './Chat.css'; // You can import your CSS file here
import { ThreeDots } from 'react-loading-icons';
import { FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import withAuthentication from './AuthenticatedComponent'; // Adjust the path
import { useCookies } from 'react-cookie'; // Import useCookies
import { AiFillDelete } from "react-icons/ai";
import {createClient} from '@supabase/supabase-js';
import { useQuestion, QuestionProvider } from './QuestionContext';
import ReactMarkdown from 'react-markdown';
import { TbBulb } from 'react-icons/tb';


const Chat2 = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  const [isIdleMessageSent, setIsIdleMessageSent] = useState(false);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [initial, setInitial] = useState(false);
  const [isCardVisible, setCardVisible] = useState(false);
  const [cardInfo, setCardInfo] = useState([]);
  const [nextQuestion, setnextQuestion] = useState([]);
  const [isHintButtonDisabled, setIsHintButtonDisabled] = useState(true); // Step 1


  const supabase = createClient(
    'supabaseUrl',
    'supabaseKey'
  ); 

  const [cookies] = useCookies(['user_data']); // Use the useCookies hook to get cookies
  console.log('User Email:', cookies.user_data.email);

  const { question } = useQuestion(QuestionProvider);
  

  async function signOutUser() {
    await supabase.auth.signOut();
    console.log("did you press the button?");
    navigate("/");
  }

  useEffect(() => {
    
    fetch('http://Routing_page/explore', {
      headers: {
        'User-Email': cookies.user_data.email,
      },
    })
      .then(response => response.json())
      .then(data => setDocuments(data.documents))
      .catch(error => console.error('Error loading documents:', error));
  }, []);

  const handleDeleteDocument = async (filename) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (confirmed) {
      try {
        const response = await fetch(`http://Routing_page/explore/${filename}`, {
          method: 'DELETE',
          headers: {
            'User-Email': cookies.user_data.email,
          },
        });
        if (response.ok) {
          // Remove the deleted document from the state	
          setDocuments(documents.filter(document => document.name !== filename));
        } else {
          console.error('Error deleting document:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };


  const handleSend = async () => {

    if (!isConversationStarted) {
      setIsConversationStarted(true); // Mark the conversation as started
    }
    if (inputText.trim() !== '') {
     
      setIsHintButtonDisabled(true);
      const newMessage = {
        text: inputText,
        sender: 'user', // 'user' or 'ptb'
      };

      setLoading(true); // Start loading animation

      const chatMessage = {
        model: "gpt-3.5-turbo-16k",
        question: inputText,
        history: [],
        temperature: 0.0,
        max_tokens: 500,
        use_summarization: false,
      };

      // Make the API call to send the user's message
      const response = await fetch('http://Routing_page/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Email': cookies.user_data.email,
        },
        body: JSON.stringify(chatMessage),
      });

      if (response.ok) {
        const responseData = await response.json();
        const assistantMessage = responseData.history[responseData.history.length - 1][1];

        // Update the chatHistory with user and assistant messages
        setMessages([...messages, newMessage, { text: assistantMessage, sender: 'assistant' }]);
        setInputText('');
      }
    }

    setLoading(false); // Start loading animation
  };

    const checkForInitialQuestion = async () => {
      if( question && !initial )
      {
        // setMessages([...messages, newMessage]);
        setInputText(question);
        console.log(inputText);
        console.log("initial question: ", question);
        handleSend();
        setInitial(true);
      }
    }

  useEffect(() => {
    checkForInitialQuestion();
  }, [question]);
  useEffect(() => {
    // Check if the conversation has started
    if (isConversationStarted) {
      // Set a timer to fetch data after 25 seconds when the messages array changes
      const fetchDataAfterDelay = setTimeout(() => {
        fetch('http://Routing_page/prediction-thought', {
          method: 'POST',  
          headers: {
            'User-Email': cookies.user_data.email,
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => { 
            setCardInfo(data.prediction[0].thoughts);
            setnextQuestion(data.prediction[0].question_prediction);
            setIsHintButtonDisabled(false);
          })
          .catch(error => {
            console.error('Error loading documents:', error);
            setIsHintButtonDisabled(true);
          });
      }, 5000); // 25 seconds in milliseconds
  
      // Clear the timer if the messages array changes again or if the component unmounts
      return () => clearTimeout(fetchDataAfterDelay);
    }
  }, [isConversationStarted, messages, cookies.user_data.email]); // Add isConversationStarted, messages, and cookies.user_data.email to the dependency array
  
    

  useEffect(() => {
    // Set a timer for 30 seconds to send a message if the user hasn't typed anything
    const timer = setTimeout(() => {
      if (isConversationStarted && !isIdleMessageSent) {
        const newMessage = {
          text: "Do you have another question? Or would you like to take a quiz?",
          sender: 'assistant',
        };
        setMessages([...messages, newMessage]);
        setIsIdleMessageSent(true); // Mark the message as sent
      }
    }, 70000);

    // Clear the timer when the component unmounts or when the user sends a message
    return () => clearTimeout(timer);
  }, [isConversationStarted, isIdleMessageSent, messages]);

  const messageContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the message container after rendering messages
    setIsHintButtonDisabled(true);
  }, [messages]);

  useEffect(() => {
    // Scroll to the bottom of the message container after rendering messages
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    navigate('/upload');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputText.trim() !== '') {
      handleSend(); // Call the handleSend function
    }
  };

  const toggleCardVisibility = () => {
    setCardVisible(!isCardVisible);
  };

  return (
    <div>
      <div className="header-bar">
        Personal Tutoring Bot
        <button className="sign-out-button" onClick={() => signOutUser()}>Sign Out</button>
      </div>
      <div className="chat-container">
        <div className="subjects-section">
          <button className="new-chat-button" onClick={handleNewChat}>Upload New File</button>
          {documents.map((document, index) => (
            <div key={index} className="subject-button">
              <div className="subject-button-text">
              {document.name}
              </div>
              <button className="delete-button" onClick={() => handleDeleteDocument(document.name)}>
                <AiFillDelete />
              </button>
            </div>
          ))}
        </div>
        <div className="divider"></div>
        <div className="chat-section">
        {isCardVisible && <div className="overlay" />}
          <div className='messageContainer' ref={messageContainerRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ptb-message'}`}
              >
                {message.sender === 'assistant' && (
                  <a
                    href="/ptb-profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://lh3.googleusercontent.com/a/AAcHTteRs-T5ebNCw7qKyeSjivLrZ32kzAxTq1F74mQ4TEbEhYc=s96-c"
                      alt={message.sender}
                      className="avatar"
                    />
                  </a>
                )}
                <div
                  className={`message-box ${message.sender === 'user' ? 'user-box' : 'ptb-box'}`}
                >
                  <ReactMarkdown>
                  {message.text}
                  </ReactMarkdown>
                </div>
                {message.sender === 'user' && (
                  <a
                    href="/user-profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={cookies.user_data.imageUrl}
                      alt={message.sender}
                      className="avatar"
                    />
                  </a>
                )}
              </div>
            ))}
          </div>
          {isCardVisible && (
        <div className="card">
          <h2>PTB Thoughts</h2>
          <ReactMarkdown>
          {cardInfo}
          </ReactMarkdown>
          <h2>Next Question</h2>
          <p>{nextQuestion}</p>
          {/* Add more data fields as needed */}
        </div>
      )}
          <div className="input-section">
          <button
          className={`bulb-button`}
          onClick={toggleCardVisibility}
          disabled={isHintButtonDisabled}
        >
          <TbBulb /> Hint
        </button>

          {/* <Link to={toggleCardVisibility} target="_blank" className="bulb-button">
              <TbBulb /> Hint
            </Link> */}
            <Link to="/fileselection" target="_blank" className="quiz-button">
              Quiz
            </Link>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown} // Add the keydown event handler here
              placeholder="Type your message..."
              className="input-field"
            />
            <button className="send-button" onClick={handleSend}>
              {loading ? <ThreeDots width="20" height="20" color="#fff" /> : <FaArrowRight />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthentication(Chat2);
