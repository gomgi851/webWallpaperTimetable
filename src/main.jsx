import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 브라우저 에러를 개발 서버에 로깅
if (import.meta.env.DEV) {
  // 미처리 에러 캐치
  window.addEventListener('error', (event) => {
    console.error('런타임 에러:', event.error);
  });

  // Promise 거부 캐치
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise 거부:', event.reason);
  });

  // React 에러 경계를 위한 console override
  const originalError = console.error;
  console.error = function(...args) {
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

