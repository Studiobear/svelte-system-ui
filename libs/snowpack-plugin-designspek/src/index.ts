import svelteRollupPlugin from 'rollup-plugin-svelte'
import fs from 'fs/promises'
import utils from '@rollup/pluginutils'
import { compile, preprocess } from 'svelte/compiler'
import { parse } from './util'

export const plugin = (
  snowpackConfig: any,
  pluginOptions: SnowpackPluginDesignspekOptions,
) => {
  const isDev = process.env.NODE_ENV !== 'production'

  let filter: any

  if (pluginOptions.include || pluginOptions.exclude)
    filter = utils.createFilter(pluginOptions.include, pluginOptions.exclude)

  if (
    snowpackConfig &&
    snowpackConfig.installOptions &&
    snowpackConfig.installOptions.rollup &&
    snowpackConfig.installOptions.rollup.plugins
  ) {
    snowpackConfig.installOptions.rollup.plugins.push(
      svelteRollupPlugin({
        extensions: ['.svelte'],
      }),
    )
  }

  return {
    name: 'snowpack-plugin-designspek',
    resolve: {
      input: ['.svelte'],
      output: ['.js', '.css'],
    },
    knownEntrypoints: ['svelte/internal'],
    async load({ filePath }: { filePath: string }) {
      const contents = await fs.readFile(filePath, 'utf-8')

      const svxPreprocess = await preprocess(contents, [], {
        filename: filePath,
      })
      const parsePre = await parse(svxPreprocess.code)
      const { js, css } = await compile(parsePre)
      // console.log('js: ', js.code)
      const output: any = {
        '.js': {
          code: js.code,
        },
      }
      if (css && css.code) {
        output['.css'] = {
          code: css.code,
        }
      }

      return output
    },
  }
}

export interface SnowpackPluginDesignspekOptions {
  /**
   * Includes only the specified paths
   */
  include?: string[]
  /**
   * Excludes the specified paths
   */
  exclude?: string[]
  /**
   * These options are passed directly to the MDSVEX compiler.
   */
  designspekOptions?: Record<string, any>
}

export default plugin
