// postcss.config.js (MUST BE THIS)
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- This MUST be the active plugin
    'autoprefixer': {},
  },
};