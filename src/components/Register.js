import React, { useState } from 'react'
import { registerWithCredentials } from '../api'
import "../Button.css"

const Register = ({ onCancel, successCallback }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // Error messages for each form field
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Event handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    registerWithCredentials(username, password)
      .then(data => { 
        if (data) successCallback()
        // Handle errors here...
      })
    // Reset the form after submission
    setUsername("")
    setPassword("")
  }

  return (
    <div>
      <h3>Create account</h3>
      <br />
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
          <div style={{ display: 'flex', justifyContent: 'center'}}>
            <button className='media-option-btn' type="submit">Register</button>
            <button className='media-option-btn' onClick={onCancel} style={{ marginLeft: '0.5em' }}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register

