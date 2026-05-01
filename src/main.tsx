import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';
import { AuthProvider } from './context/AuthContext';
import App from './App';

Amplify.configure(amplifyconfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
