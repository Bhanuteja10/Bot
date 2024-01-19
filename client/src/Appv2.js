

import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Login from './components/login';
import Chat from './components/chat';
import Quiz from './components/quiz';
import Upload from './components/upload';
import FileSelection from './components/fileSelection';
import { ChakraProvider } from '@chakra-ui/react'
import React from "react";
import LoginTest from './components/loginPage';
import Success from './components/successPage';



function App() {

  return (
    <ChakraProvider>
    <BrowserRouter>
    <div className="App"></div>
      <Routes>
        <Route path="/"element={<LoginTest/>}/>
        <Route path="/success" element={<Success/>}/>
        <Route path="/chat"element={<Chat/>}/>
        <Route path="/quiz" element={<Quiz/>}/>
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/fileSelection" element={<FileSelection/>}/>
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
  );
}

export default App;