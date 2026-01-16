import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// 1. 루트 엘리먼트를 상수로 관리
const rootElement = document.getElementById('root');

// 2. 에러 핸들링 보강
if (!rootElement) {
  const errorMsg = "루트 엘리먼트(#root)를 찾을 수 없습니다. index.html 파일을 확인하세요.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// 3. React 18 루트 생성
const root = ReactDOM.createRoot(rootElement);

// 4. 렌더링
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
