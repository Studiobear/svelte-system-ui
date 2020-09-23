import svelte from 'rollup-plugin-svelte'
import autoPreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json'

const production = process.env.NODE_ENV

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase())

export default {
  input: 'src/index.ts',
  external: ['@studiobear/designspek'],
  output: [
    {
      file: pkg.module,
      format: 'es',
      globals: { '@studiobear/designspek': 'designspek' },
      sourcemap: production,
    },
    {
      file: pkg.main,
      format: 'umd',
      name,
      globals: { '@studiobear/designspek': 'designspek' },
      sourcemap: production,
    },
  ],
  plugins: [
    typescript({ sourceMap: true }),
    svelte({
      dev: !production,
      preprocess: autoPreprocess(),
    }),
    resolve()
  ],
  watch: {
    clearScreen: false,
  },
}
