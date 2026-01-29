import {
  createRootRouteWithContext,
  createRouter,
  HeadContent,
  Outlet,
} from "@tanstack/react-router"
import { indexRoute } from "./components/Screens/Welcome/WelcomeMessage"
import { appLayoutRoute } from "./App"
import { dashboardRoute } from "./components/Screens/Dashboard/Dashboard"
import {
  mediaIdRoute,
  mediaLayoutRoute,
} from "./components/MediaRenderer/MediaRenderer"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NotFound } from "./components/Screens/Loading/NotFound"

// Declare route tree in reverse order i.e. from leaves to root
const mediaLayoutTree = mediaLayoutRoute.addChildren([mediaIdRoute])

const appLayoutTree = appLayoutRoute.addChildren([
  indexRoute,
  dashboardRoute,
  mediaLayoutTree,
])

export const rootRoute = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { title: "Notestamp" },
      {
        name: "description",
        content: "Write notes synced with media",
      },
    ],
  }),
  errorComponent: () => <>Error</>,
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
})

export const routeTree = rootRoute.addChildren([appLayoutTree])

const queryClient = new QueryClient()
window.__TANSTACK_QUERY_CLIENT__ = queryClient

export const router = createRouter({
  routeTree,
  context: { queryClient },
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
  defaultNotFoundComponent: () => (
    <div className="h-screen">
      <NotFound />
    </div>
  ),
})
