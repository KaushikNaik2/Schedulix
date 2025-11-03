// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url'; // <--- 1. Import fileURLToPath from 'url'
import path from 'path'; // <--- 2. Import path

// Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // <--- 3. Calculate __dirname equivalent

// Make sure you import the Tailwind plugin if you are using it
// import tailwindcss from '@tailwindcss/vite'; 

// vite.config.js (The final suppress step)

// ... previous imports and resolve block ...

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // ADD THIS BLOCK TO SUPPRESS THE WARNING:
  server: {
    hmr: {
      // Disables the HMR overlay in the browser on warnings/errors
      overlay: false, 
    },
  },
  // ... any other configs (like ssr) ...
});