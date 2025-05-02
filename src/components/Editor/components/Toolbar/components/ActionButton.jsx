import React from "react"
import { Button, Icon } from "./ui"

export const ActionButton = ({ icon, ...props }) => {
  return (
    <Button { ...props }>
      <Icon>{icon}</Icon>
    </Button>
  )
}


