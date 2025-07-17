import { useState } from "react"
import ModalLayout from "../ModalLayout"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const RegisterModal = ({ onRegister, onClose }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <ModalLayout onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Sign up</DialogTitle>
        <DialogDescription>Create a new account</DialogDescription>
      </DialogHeader>
      <form
        id="registerForm"
        onSubmit={e => {
          e.preventDefault()
          onRegister(username, password)
        }}
        className="flex justify-center"
      >
        <div>
          <div>
            <label> E-mail </label>
            <Input
              type="email"
              value={username}
              required
              autoFocus
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label> Password </label>
            <Input
              type="password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
      </form>
      <DialogFooter>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button form="registerForm" type="submit">
          Sign up
        </Button>
      </DialogFooter>
    </ModalLayout>
  )
}

export default RegisterModal
