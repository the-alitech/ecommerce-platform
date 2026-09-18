import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sidebar: { DEFAULT: '#1e1b4b', foreground: '#e0e7ff' },
      },
    },
  },
  plugins: [],
};

export default config;
