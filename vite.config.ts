import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'strip-lucide-sourcemaps',
      transform(code, id) {
        if (id.includes('lucide-react')) {
          return { code: code.replace(/\/\/# sourceMappingURL=\S+\.map/g, ''), map: null }
        }
      },
    },
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'SOURCEMAP_ERROR') return
        warn(warning)
      },
    },
  },
})
