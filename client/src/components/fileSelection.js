import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileSelection.css'; // Create a separate CSS file for styling
import withAuthentication from './AuthenticatedComponent'; // Adjust the path
import { useCookies } from 'react-cookie'; // Import useCookies

const FileSelection = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  const [cookies] = useCookies(['user_data']); // Use the useCookies hook to get cookies

  const handleFileSelect = (selectedFile) => {
    // Open the quiz page in a new tab with the selected file data
    setSelectedFileName(selectedFile);
    console.log(selectedFile);
    navigate(`/quiz/${selectedFile}`);
  };

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

  return (
    <div className="file-selection-container">
      <h2 className="file-selection-heading">Select a File to Create a Quiz</h2>
      <div className="file-buttons">
        {documents.map((document, index) => (
            <button
                key={index}
                className="file-button"
                onClick={() => handleFileSelect(document.name)}
            >
                {document.name}
            </button>
        ))}
        {/* Add more buttons as needed */}
      </div>
    </div>
  );
};

export default withAuthentication(FileSelection);