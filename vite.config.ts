import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      // @를 src 폴더로 지정하는 것이 일반적입니다. 
      // 현재 구조에 맞춰 사용하세요.
      '@': path.resolve(__dirname, './src'), 
    },
  },
  // 빌드 시 정적 파일 경로 에러(404)를 방지하기 위해 추가
  base: '/', 
});
