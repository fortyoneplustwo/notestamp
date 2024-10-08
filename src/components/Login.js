import React, { useState } from 'react'
import { loginWithCredentials } from '../api'
import "../Button.css"
import Register from './Register'
import { WithToolbar, Toolbar } from './MediaRenderer/components/Toolbar'

const Login = ({ onCancel, successCallback }) => {
  // State variables to store the username and password
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [title, setTitle] = useState('Sign in')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Event handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // Client side validation here
    loginWithCredentials(username, password)
      .then(userData => {
        if (userData) successCallback(userData)
      })
    // Reset the form after submission
    setUsername("")
    setPassword("")
  }

  return (
    <WithToolbar>
      <Toolbar><span><strong>{ !showRegister ? 'Sign in to account' : 'Register an account' }</strong></span></Toolbar>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        {!showRegister && <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center'}} >
            <div style={{ display: 'flex', flexDirection: 'column'}}>
              <label>
                E-mail: &nbsp;
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p style={{ fontSize: 'small', color: 'red' }}>{usernameError}</p>
              <br />
              <label>
                Password: &nbsp;
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={{ fontSize: 'small', color: 'red' }}>{passwordError}</p>
              <br />
              <br />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className='media-option-btn' type="submit">Login</button>
                <button className='media-option-btn' 
                  onClick={onCancel} 
                  style={{ marginLeft: '0.5em' }}
                >
                  Cancel
                </button>
              </div>
              <br></br>
              <div style={{ display: 'flex', justifyContent: 'center' }}><p>Don't have an account?</p>
                &nbsp;
                <button onClick={()=>{setShowRegister(true)}} 
                  className='nav-btn' style={{ color: 'orangered' }}
                >
                  Create account
                </button>
              </div>
            </div>
          </form>
        </div>
        }
        {showRegister && <Register onCancel={onCancel} successCallback={() => { setShowRegister(false) }} />}
      </div>
    </WithToolbar>
  )
}

export default Login

