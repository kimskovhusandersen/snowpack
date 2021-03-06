const path = require('path')
const fs = require('fs')
const findUp = require('find-up').sync

const sveltePreprocess = require('svelte-preprocess')

const includePaths = ['src', 'node_modules', path.join(process.cwd(), 'src'), process.cwd()]
let directory = findUp('node_modules', { cwd: process.cwd(), type: 'directory' })
do {
  includePaths.push(directory)
} while (
  (directory = findUp('node_modules', {
    cwd: path.dirname(path.dirname(directory)),
    type: 'directory',
  }))
)

includePaths.push(...module.paths.filter((directory) => fs.existsSync(directory)))

module.exports = {
  preprocess: sveltePreprocess({
    // sourceMap: true, once svelte-preprocess@4

    babel: {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            bugfixes: true,
            shippedProposals: true,
            loose: true,
            modules: false,
            targets: {
              node: '12.4',
            },
          },
        ],
        require.resolve('@babel/preset-typescript'),
      ],
      plugins: [require.resolve('babel-plugin-dynamic-import-node')],
    },

    typescript: {
      /**
       * Type checking can be skipped by setting 'transpileOnly: true'.
       * This speeds up your build process.
       *
       * Checking is done using svelte-check
       */
      transpileOnly: true,
    },

    globalStyle: true, // <style global>...</style>
    scss: {
      includePaths,
      // use the sync render method which is faster for dart sass
      renderSync: true,
      implementation: require('sass'),
    },

    pug: false,
    coffeescript: false,
  }),
}
