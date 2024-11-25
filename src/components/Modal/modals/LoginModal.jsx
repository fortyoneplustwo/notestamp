import {  useState } from "react"
import { DefaultButton } from "../../Button/Button"
import ModalLayout from "../ModalLayout"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const LoginModal = ({ onLogin, onRegister, onClose }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <ModalLayout onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          Sign in
        </DialogTitle>
        <DialogDescription>
          Sign in to your account
        </DialogDescription>
      </DialogHeader>
      <form 
        id="loginForm"
        onSubmit={(e) => { 
          e.preventDefault()
          onLogin(username, password) 
        }} 
        className="flex justify-center" >
        <div>
          <div>
            <Label> E-mail </Label>
            <Input
              type="email"
              value={username}
              autoFocus
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <Label> Password </Label>
            <Input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
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
      <DialogFooter>
        <DefaultButton onClick={onClose}>Cancel</DefaultButton>
        <DefaultButton variant="default" form="loginForm" type="submit">Sign in</DefaultButton>
      </DialogFooter>
    </ModalLayout>
  )
}

export default LoginModal
