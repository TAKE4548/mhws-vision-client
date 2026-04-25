import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// React Query クライアントの初期化
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

async function enableMocking() {
  // Vite の開発環境フラグを確認
  if (!import.meta.env.DEV) {
    return;
  }

  // LocalStorageからスタブモード設定を確認
  const isStubMode = localStorage.getItem('api_stub_mode') !== 'false';
  if (!isStubMode) {
    console.log('[App] Live Server Mode: MSW is disabled.');
    return;
  }
 
  // MSW ワーカーの動的インポートと起動
  const { worker } = await import('./mocks/browser');
  
  // note: worker.start() は プロミスを返す
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
