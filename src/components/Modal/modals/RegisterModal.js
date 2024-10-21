import { forwardRef, useState } from "react"
import Button from "../../Button/Button"
import ModalLayout from "../ModalLayout"

const RegisterModal = forwardRef(({ onRegister, onClose }, ref) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <ModalLayout ref={ref} onClose={onClose}>
      <form 
        onSubmit={(e) => { 
          e.preventDefault()
          onRegister(username, password) 
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
          <div className="flex justify-center mt-4 mb-3">
            <Button type="submit">Sign up</Button>
            <Button 
              onClick={onClose}
              style={{ marginLeft: "0.5em"}}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </ModalLayout>
  )
})

export default RegisterModal
