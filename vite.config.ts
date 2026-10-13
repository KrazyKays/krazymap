import { defineConfig } from 'vite';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'krazymap';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repository}/` : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}));
