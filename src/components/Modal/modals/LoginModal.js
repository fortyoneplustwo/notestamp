import { forwardRef, useState } from "react"
import Button from "../../Button/Button"
import ModalLayout from "../ModalLayout"

const LoginModal = forwardRef(({ onLogin, onRegister, onClose }, ref) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <ModalLayout ref={ref} onClose={onClose}>
      <form 
        onSubmit={(e) => { 
          e.preventDefault()
          onLogin(username, password) 
        }} 
        className="flex justify-center" >
        <div>
          <div>
            <div><label> E-mail </label></div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-black p-1 w-full"
            />
          </div>
          <div className="mt-2">
            <div><label> Password </label></div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-black p-1 w-full"
            />
          </div>
          <div className="flex justify-center mt-4 gap-2">
            <Button type="submit">Sign in</Button>
            <Button onClick={onClose}>Cancel</Button>
          </div>
          <br></br>
          <div className="flex justify-center">
            <p>Don't have an account? &nbsp;</p>
            <button 
              onClick={onRegister} 
              className="border-none bg-transparent"
              style={{ color: 'orangered' }}
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
    </ModalLayout>
  )
})

export default LoginModal
