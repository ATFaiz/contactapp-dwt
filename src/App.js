import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Routes, Route} from "react-router-dom";
import Main from './crud/main'
import Create from './crud/create'
import Edit from './crud/edit'
import Show from './crud/show'

function App() {

  return (
      <Routes>
        <Route path='/contact/' element ={<Main />} />
        <Route path='/contact/create' element ={<Create />} />
        <Route path='/contact/edit/:id' element ={<Edit />} />
        <Route path='/contact/show/:id' element ={<Show />} />
      </Routes>
  );
}

export default App;
