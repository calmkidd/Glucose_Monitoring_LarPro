import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; 
// Letakkan nurse.css di paling bawah agar gaya premium kita menang, 
// tapi pastikan tidak merusak komponen dasar.
import './styles/nurse.css'; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);