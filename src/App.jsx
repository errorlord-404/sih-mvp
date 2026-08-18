import { RouterProvider } from 'react-router-dom'
import { router } from './routes/index.jsx'
import { LanguageProvider } from './hooks/useLanguage.jsx'
import { AIConversationProvider } from './context/AIConversationContext.jsx'

function App() {
  return <LanguageProvider>
            <AIConversationProvider><RouterProvider router={router} /></AIConversationProvider>
          </LanguageProvider>
}

export default App
