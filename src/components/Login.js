import React, { useState } from 'react'

const Login = ({ onCancel }) => {
  // State variables to store the username and password
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Event handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // Authentication
    const credentials = {
      username: username,
      password: password
    }
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json"
      },
      body: credentials
    }

    fetch('http://localhost:8080/auth/signin', requestOptions)
      .then(response => {
        console.log(response.json())
      })
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.log(error.message())
      })

    // Reset the form after submission
    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username: &nbsp;
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label>
          Password: &nbsp;
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <br />
        <button type="submit">Login</button>
        <button onClick={onCancel} style={{ marginLeft: '0.5em' }}>Cancel</button>
      </form>
    </div>
  )
}

export default Login

