import { forwardRef, useState } from "react"
import AppToolbarButton from "../../Button/AppToolbarButton"
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
            <AppToolbarButton label={"Sign up"} type="submit" />
            <AppToolbarButton 
              onClick={onClose}
              label={"Cancel"}
              style={{ marginLeft: "0.5em"}}
            />
          </div>
        </div>
      </form>
    </ModalLayout>
  )
})

export default RegisterModal
