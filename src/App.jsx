import { RouterProvider } from 'react-router-dom'
import { router } from './routes/index.jsx'
import { LanguageProvider } from './hooks/useLanguage.jsx'

function App() {
  return <LanguageProvider>
            <RouterProvider router={router} />
          </LanguageProvider>
}

export default App
