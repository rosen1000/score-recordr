module.exports = {
  content: ['./**/*.{vue,js,ts,jsx,tsx}','!node_modules/**'],
  safelist: [
    {
      pattern: /^bg-.*-500$/,
    }
  ]
}