import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import theme from './theme'
import { App } from './App'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TermReplacer } from './pages/TermReplacer'
import { Workflows } from './pages/Workflows'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/pages/replace',
        element: <TermReplacer />
      },
      {
        path: '/pages/workflows',
        element: <Workflows />
      },
      {
        index: true,
        element: <TermReplacer />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)
