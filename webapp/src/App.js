import React, { useState } from 'react'
import './App.css'
import Router from './Router'
import { UserContext } from './context'

export default function App () {
  const [userId, setUserId] = useState('')
  const setUserContext = user => setUserId(user)
  return (
    <div className="App">
      <UserContext.Provider value={{ userId, setUser: setUserContext }}>
        <header className="App-header">
          <Router />
        </header>
      </UserContext.Provider>
    </div>
  )
}
