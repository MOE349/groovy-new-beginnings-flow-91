import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { authInterceptor } from './services/auth.interceptor'

// Initialize auth interceptor for proactive token refresh
authInterceptor.initialize()

createRoot(document.getElementById("root")!).render(<App />);
