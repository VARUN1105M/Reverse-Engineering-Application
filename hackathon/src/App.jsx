import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploader from './Pages2/File';
import Home from './Page3/Home';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/api" element={<FileUploader />} />
      </Routes>
    </Router>
  );
}

export default App;
