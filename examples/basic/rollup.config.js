import bucklescript from '/home/august/open-source/rollup-plugin-bucklescript/dist/rollup-plugin-bucklescript.es.js';
// import bucklescript from "/home/august/open-source/rollup-plugin-bucklescript/src";

console.log(bucklescript);

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
  },
  plugins: [bucklescript()],
};
