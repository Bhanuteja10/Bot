import React, { useState } from 'react';
import './Upload.css';
import { useNavigate } from 'react-router-dom';
import { TailSpin } from 'react-loading-icons';
import withAuthentication from './AuthenticatedComponent'; // Adjust the path
import { useCookies } from 'react-cookie'; // Import useCookies

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state

    const navigate = useNavigate();

    const [cookies] = useCookies(['user_data']); // Use the useCookies hook to get cookies

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setUploadStatus('');
    };

    const handleFileDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        setSelectedFile(droppedFile);
        setUploadStatus('');
    };

    const handleCancel = () => {
        navigate('/chat'); // Navigate back to the chat page
    };

    const handleFileUpload = async () => {
        if (selectedFile) {
            const formData = new FormData();
            const fileNameWithoutHash = selectedFile.name.replace(/#/g, ' '); // Remove '#' from the file name
            formData.append('file', new File([selectedFile], fileNameWithoutHash));
            console.log(fileNameWithoutHash);
    
            setLoading(true); // Start loading animation
    
            try {
                const response = await fetch('http://Routing_page/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'User-Email': cookies.user_data.email, // Send user's email as a custom header
                    },
                });
    
                setLoading(false); // Stop loading animation
    
                if (response.ok) {
                    // File uploaded successfully
                    setUploadStatus('File uploaded successfully');
                    setTimeout(() => {
                        navigate('/chat'); // Redirect to the chat page after successful upload
                    }, 2000); // Display success message for 2 seconds
                } else {
                    // Error uploading file
                    setUploadStatus('Error uploading file. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                setUploadStatus('Error uploading file. Please try again.');
            }
        } else {
            setUploadStatus('Please select a file to upload.');
        }
    };
    

    return (
        <div className="upload-page">
            <div className="header-bar">
                Personal Tutoring Bot
            </div>
            <div className="upload-container">
                <label htmlFor="fileInput" className="upload-label">
                    <div
                        className="upload-box"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                    >
                        {selectedFile ? (
                            <p>Selected File: {selectedFile.name}</p>
                        ) : (
                            <p>Drag & drop a file here</p>
                        )}
                    </div>
                </label>
                <input
                    type="file"
                    id="fileInput"
                    className="hidden-input"
                    onChange={handleFileChange}
                />
                <div className="button-container">
                    <button
                        className="cancel-button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="upload-button"
                        onClick={handleFileUpload}
                        disabled={loading} // Disable the button during upload
                    >
                        {loading ? <TailSpin width="20" height="20" color="#fff" /> : 'Upload'}
                    </button>
                </div>
                {uploadStatus && (
                    <p className={`upload-status ${uploadStatus.includes('successfully') ? 'success' : 'error'}`}>
                        {uploadStatus}
                    </p>
                )}
            </div>
        </div>
    );
};

export default withAuthentication(Upload);
