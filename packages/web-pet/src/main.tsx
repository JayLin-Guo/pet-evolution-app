import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // 注意：React 18 的 StrictMode 在开发环境会对 effects 进行“双调用”检查，
  // 会导致像 SpinePlayer 这类包含网络请求的副作用出现“请求两次”的现象。
  // 这里关闭 StrictMode，避免 dev 环境重复加载资源。
  <App />,
);
