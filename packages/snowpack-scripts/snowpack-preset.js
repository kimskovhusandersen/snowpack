const path = require('path')
const fs = require('fs')

const pkgDir = require('pkg-dir').sync()
const svelteConfigFile = require('find-up').sync('svelte.config.js', { cwd: pkgDir })
const useSvelte = fs.existsSync(svelteConfigFile)
const svelteConfig = useSvelte && loadSvelteConfig(svelteConfigFile)

// Like https://graphql-config.com/usage#config-search-places
// https://github.com/kamilkisiela/graphql-config/blob/254dd12daaa73a72b149d63da5f77030979a2d5c/src/helpers/cosmiconfig.ts#L64
const graphql = require('./graphql/find-config')(pkgDir)

const proxy = {}

if (graphql) {
  const url = graphql.endpoint || graphql.schema

  if (url && /^https?:\/\//.test(url)) {
    proxy['/-/graphql'] = url
  }
}

module.exports = {
  scripts: {
    'mount:public': `mount ${path.relative(process.cwd(), path.join(__dirname, 'public'))} --to /`,
    'mount:src': 'mount src --to /_dist_',
  },
  plugins: [
    require.resolve('@snowpack/plugin-svelte'),
    require.resolve('@carv/snowpack-plugin-rollup'),
  ],
  installOptions: {
    sourceMap: true,
    rollup: {
      dedupe: ['svelte'],
      plugins: [
        require('rollup-plugin-node-polyfills')(),
        useSvelte &&
          require('rollup-plugin-svelte')({
            ...svelteConfig,
            dev: true,
            css: true, // include css in the JavaScript class and inject at runtime
            onwarn(warning) {
              // Ignore warning for missing export declartion it maybe a module context export
              if (warning.code === 'missing-declaration') {
                return
              }

              console.warn(`[${warning.code}] ${warning.message}\n${warning.frame}`)
            },
          }),
      ].filter(Boolean),
    },
  },
  buildOptions: {
    // Prevent accidental pickup of package.json[homepage]
    baseUrl: '/',
  },
  proxy,
}

function loadSvelteConfig(file) {
  const { compilerOptions, ...svelteConfig } = require(file)
  return Object.assign(svelteConfig, compilerOptions)
}
