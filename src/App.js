import React, {useState} from 'react'
import {Routes,Route} from 'react-router-dom'
import { Register } from './components/Register'
import {Login} from './components/Login'
import {PrivateMessage} from './components/PrivateMessage'
import { PublicMessage } from './components/PublicMessage'
import {Mapa} from './components/Mapa'

const App = () => {
  const [currentForm,setCurrentForm] = useState('login');
  const [currentScreen,setCurrentScreen] = useState('public');

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }

  const toggleScreen = (screenName) =>{
    setCurrentScreen(screenName);
  }

  return (
   <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/registro' element={<Register/>} />
      {/* <Route path='/mensajes' element={<PrivateMessage/>} /> */}
      <Route path='/mensajes' element={<PublicMessage/>} />

   </Routes>
  )
}

export default App