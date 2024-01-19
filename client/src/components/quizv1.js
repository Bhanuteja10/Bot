import React, { useState, useEffect } from 'react';
import './Quiz.css';
import withAuthentication from './AuthenticatedComponent'; // Adjust the path
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie'; // Import useCookies

const Quiz = () => {

    //fetch quizData from the api url /api/questions as a json object
    // const [quizData, setQuizData] = useState([]);
    // useEffect(() => {
    //     fetch('/api/questions')
    //         .then((response) => response.json()) // parse the JSON from the server
    //         .then((responseData) => {
    //             setQuizData(responseData);
    //         });
    // }, []);

  const [questions, setQuestions] = useState();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizResults, setQuizResults] = useState([]);
  const { selectedFile } = useParams();
  const [cookies] = useCookies(['user_data']); // Use the useCookies hook to get cookies

  useEffect(() => {
    if (selectedFile) {
      // Fetch quiz questions based on the selected file from API
      fetch(`http://Routing_page/quiz/${selectedFile}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Email': cookies.user_data.email,
        },
        // body: JSON.stringify({ question: 'Start quiz' }),
      })
        
      .then((data) => {
          // setting to json for now testing: shlok
          console.log(data);
          setQuestions(data); // Assuming your API returns questions as 'data.questions'
        })
        .catch((error) => {
          console.error('Error loading questions:', error);
        });
    }
  }, [selectedFile]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      const isCorrect = questions[currentQuestion].correct === selectedAnswer;
      console.log(questions[currentQuestion].correct);
      setQuizResults(prevResults => [
        ...prevResults,
        { question: questions[currentQuestion].question, isCorrect }
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
  };

  if (questions.length === 0) {
    console.log('No questions were found!');
    return <div>Loading questions...</div>;
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div style={{ backgroundColor: '#507084', minHeight: '100vh', padding: '20px' }} class='quiz-page'>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '20px' }}>
        {!showResults ? (
          <>
            <h2>Quiz Time</h2>
            <p>Question {currentQuestion + 1}/{questions.length}</p>
            <p>{currentQuestionData.question}</p>
            <ul>
              {Object.entries(currentQuestionData.options).map(([optionKey, optionValue], index) => (
                <button
                  key={optionKey}
                  type="submit"
                  onClick={() => handleAnswerSelect(optionValue)}
                  style={{
                    backgroundColor: selectedAnswer === optionValue ? '#507084' : 'white',
                    color: selectedAnswer === optionValue ? 'white' : 'black',
                    borderRadius: '15px',
                    padding: '10px',
                    margin: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {optionValue}
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
          </>
        )}
      </div>
    </div>
  );
};

export default withAuthentication(Quiz);
