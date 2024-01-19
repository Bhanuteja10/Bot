import React, { useState, useEffect } from 'react';
import './Quiz.css';
import withAuthentication from './AuthenticatedComponent'; // Adjust the path
import { useParams, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie'; // Import useCookies
import LoadingPage from './LoadingPage';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const selectedFile = useParams(); //  useParams();
  const [cookies] = useCookies(['user_data']); // Use the useCookies hook to get cookies

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedFile) {
      // Fetch quiz questions based on the selected file from API
      console.log(selectedFile.selectedFile);
      fetchQuizQuestions(selectedFile);
    }
  }, [selectedFile, cookies.user_data.email]);

  const fetchQuizQuestions = (file) => {
    setLoading(true);
    console.log(file.selectedFile);
    fetch(`http://Routing_page/quiz/${file.selectedFile}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Email': cookies.user_data.email,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data);
        setQuestions(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading questions:', error);
        setLoading(false);
      });
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      const isCorrect = questions[currentQuestion].answer === selectedAnswer;
      setQuizResults((prevResults) => [
        ...prevResults,
        { question: questions[currentQuestion].question, isCorrect },
      ]);

      if (isCorrect) {
        setCorrectAnswers(correctAnswers + 1);
      }

      if (currentQuestion < questions.length - 1) {
        setSelectedAnswer(null);
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setCorrectAnswers(0);
    setQuizResults([]);
    // fetchQuizQuestions(selectedFile); // Reload questions when restarting
  };

  if (loading) {
    // Display a loading indicator while waiting for the response
    return <LoadingPage />;
  }

  if (questions.length === 0) {
    console.log('No questions were found!');
    return (<button onClick={navigate('/chat')}>Error NO Qs, Go Back</button>);
  }

  const currentQuestionData = questions[currentQuestion];

  const handleCloseTab = () => {
    window.close(); // Close the current tab or window
  };

  return (
    <div style={{ backgroundColor: '#507084', minHeight: '100vh', padding: '20px' }} className='quiz-page'>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '20px' }}>
        {!showResults ? (
          <>
            <h2>Quiz Time</h2>
            <p>Question {currentQuestion + 1}/{questions.length}</p>
            <p>{currentQuestionData.question}</p>
            <ul>
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswerSelect(option)}
                  style={{
                    backgroundColor: selectedAnswer === option ? '#507084' : 'white',
                    color: selectedAnswer === option ? 'white' : 'black',
                    borderRadius: '15px',
                    padding: '10px',
                    margin: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {option}
                </button>
              ))}
            </ul>
            <button className='next-button' onClick={handleSubmit}>Next</button>
          </>
        ) : (
          <>
            <h2>Quiz Results</h2>
            <ul>
              {quizResults.map((result, index) => (
                <li key={index}>
                  {result.isCorrect ? <span>✅</span> : <span>❌</span>} {result.question}
                </li>
              ))}
            </ul>
            <p>You answered {correctAnswers} out of {questions.length} questions correctly.</p>
            <button className='next-button' onClick={handleRestart}>Restart</button>
            {/* <button className= 'next-button' onClick={navigate('/fileSelection')}>New Quiz</button> */}
            <button className='next-button' onClick={handleCloseTab}>Exit</button>
          </>
        )}
      </div>
    </div>
  );
};

export default withAuthentication(Quiz);