import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { EntitlementsProvider } from './context/EntitlementsContext'
import AppRouter from './routes/AppRouter'

function App() {
  return (
      <AuthProvider>
        <EntitlementsProvider>
          <AppRouter />
        </EntitlementsProvider>
        <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#020617',
                color: '#ffffff',
                border: '1px solid #1e293b',
              },
            }}
        />
      </AuthProvider>
  )
}

export default App
