import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/loginPage';
import Success from './components/successPage';
import Chat from './components/chat'
import Quiz from './components/quiz'
import Upload from './components/upload'
import First from './components/firstPage'
import FileSelection from './components/fileSelection'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/success" element={<Success />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/quiz/:selectedFile" element={<Quiz />} />
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/fileSelection" element={<FileSelection/>}/>
        <Route path="/first" element={<First />} />
      </Routes>
    </Router>
  );

}

export default App;
