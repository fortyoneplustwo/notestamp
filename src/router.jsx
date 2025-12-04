import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router"
import { indexRoute } from "./components/Screens/Welcome/WelcomeMessage"
import { appLayoutRoute } from "./App"
import { dashboardRoute, localDashboardRoute } from "./components/Screens/Dashboard/Dashboard"
import { localMediaIdRoute, localMediaLayoutRoute, mediaIdRoute, mediaLayoutRoute } from "./components/MediaRenderer/MediaRenderer"

// Create top level route
export const rootRoute = createRootRoute({
  notFoundComponent: () => <>404 Not Found</>,
  errorComponent: () => <>Error</>,
})

// Create file sync layout route
// Essentially a ghost layout exclusively used to handle navigation 
// between local and non-local routes.
export const localLayoutRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  component: () => <Outlet/>,
  path: "/local/workspace",
})

// Create route tree
// Declared in reverse order: children -> parent
const mediaLayoutTree = mediaLayoutRoute.addChildren([mediaIdRoute])

const localMediaLayoutTree = localMediaLayoutRoute.addChildren([localMediaIdRoute])

const localLayoutTree = localLayoutRoute.addChildren([localDashboardRoute, localMediaLayoutTree])

const appLayoutTree = appLayoutRoute.addChildren([indexRoute, localLayoutTree, dashboardRoute, mediaLayoutTree])

export const routeTree = rootRoute.addChildren([appLayoutTree])

// Create router
export const router = createRouter({ routeTree })


