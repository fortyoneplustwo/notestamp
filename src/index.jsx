import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
// import App from "./App"
import reportWebVitals from "./reportWebVitals"
// import { AppContextProvider } from "./context/AppContext"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { indexRoute } from "./components/Screens/Welcome/WelcomeMessage"
import { rootRoute } from "./App"

const routeTree = rootRoute.addChildren([indexRoute])

const router = createRouter({ routeTree })

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    {/* 
    <AppContextProvider>
      <App />
    </AppContextProvider>
    */}
    <RouterProvider router={router} />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log)
