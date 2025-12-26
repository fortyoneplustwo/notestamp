import {
  createRootRouteWithContext,
  createRouter,
} from "@tanstack/react-router"
import { indexRoute } from "./components/Screens/Welcome/WelcomeMessage"
import { appLayoutRoute } from "./App"
import { dashboardRoute } from "./components/Screens/Dashboard/Dashboard"
import {
  mediaIdRoute,
  mediaLayoutRoute,
} from "./components/MediaRenderer/MediaRenderer"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Declare route tree in reverse order i.e. from leaves to root
const mediaLayoutTree = mediaLayoutRoute.addChildren([mediaIdRoute])

const appLayoutTree = appLayoutRoute.addChildren([
  indexRoute,
  dashboardRoute,
  mediaLayoutTree,
])

export const rootRoute = createRootRouteWithContext()({
  errorComponent: () => <>Error</>,
})

export const routeTree = rootRoute.addChildren([appLayoutTree])

const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
  defaultNotFoundComponent: () => {
    return (
      <div>
        <h1>404 Not Found</h1>
      </div>
    )
  },
})
