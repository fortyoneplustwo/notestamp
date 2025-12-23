import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router"
import { indexRoute } from "./components/Screens/Welcome/WelcomeMessage"
import { appLayoutRoute } from "./App"
import { dashboardRoute } from "./components/Screens/Dashboard/Dashboard"
import {
  mediaIdRoute,
  mediaLayoutRoute,
} from "./components/MediaRenderer/MediaRenderer"

// Create route tree
// Declared in reverse order i.e. from leaves to root
const mediaLayoutTree = mediaLayoutRoute.addChildren([mediaIdRoute])

const appLayoutTree = appLayoutRoute.addChildren([
  indexRoute,
  dashboardRoute,
  mediaLayoutTree,
])

// Root route
export const rootRoute = createRootRoute({
  notFoundComponent: () => <>404 Not Found</>,
  errorComponent: () => <>Error</>,
})

export const routeTree = rootRoute.addChildren([appLayoutTree])

// Create router
export const router = createRouter({ routeTree })
