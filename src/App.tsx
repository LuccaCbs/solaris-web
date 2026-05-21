import { Toaster } from 'react-hot-toast'
import AppRouter from './routes/AppRouter'

function App() {
  return (
      <>
        <AppRouter />
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
      </>
  )
}

export default App