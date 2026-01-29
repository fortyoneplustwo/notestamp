import { useAppContext } from "@/context/AppContext"
import { router } from "@/router"

export const forward = (to, { src, mimetype }) => {
  useAppContext.setState({ isForwarding: true })
  router.navigate({ to, search: { src, mimetype }, replace: true })
}
