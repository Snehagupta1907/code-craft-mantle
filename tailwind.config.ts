import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'claude-purple': '#7C41F5',
        'claude-purple-light': '#9E6CFF',
        'claude-purple-dark': '#5A2EBB',
        'claude-bg': '#FFFFFF',
        'claude-text': '#333333',
        'claude-sidebar': '#F5F5F5',
        'claude-border': '#E5E5E5',
        'editor-bg': '#FAFAFA',
        'sidebar-bg': '#F0F0F0',
        'chat-bg': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
export default config;
