const path = require('path')
const sao = require('sao')

const generator = path.join(__dirname, '..')

test.each([
  ['npm', { typescript: false }],
  ['npm', { typescript: true }],
  ['yarn', { typescript: false }],
  ['yarn', { typescript: true }],
])('form (%s): %j', async (npmClient, answers) => {
  const stream = await sao.mock(
    { generator, npmClient },
    {
      starter: 'form',
      ...answers,
    },
  )

  expect(stream.fileList).toIncludeAllMembers([
    '.editorconfig',
    '.gitattributes',
    '.gitignore',
    '.npmrc',
    '.nvmrc',
    '.vscode/extensions.json',
    'CHANGELOG.md',
    'README.md',
    'package-scripts.js',
    'package.json',
    'src/__preview__/app.css',
    'src/__preview__/app.svelte',
    'src/__preview__/favicon.png',
    'src/if-error.svelte',
    'src/main.svelte',
    'svelte.config.js',
  ])

  const pkg = JSON.parse(await stream.readFile('package.json'))

  const deps = [...Object.keys(pkg.devDependencies)]

  expect(deps).toIncludeAllMembers([
    '@carv/eslint-config',
    '@carv/prettier-config',
    '@carv/snowpack-scripts',
    'doctoc',
    'envinfo',
    'eslint',
    'jest',
    'nps',
    'prettier',
    'snowpack',
    '@testing-library/svelte',
    '@testing-library/user-event',
    'svelte',
    'svelte-check',
    'svelte-htm',
    '@types/yup',
    'svelte-formup',
    'yup',
  ])

  if (answers.typescript) {
    expect(stream.fileList).toIncludeAllMembers([
      'src/__preview__/start.ts',
      'src/__tests__/main.test.ts',
      'src/types/index.ts',
      'tsconfig.json',
    ])
    expect(deps).toIncludeAllMembers(['@carv/types', 'typescript'])
  } else {
    expect(stream.fileList).toIncludeAllMembers([
      'src/__preview__/start.js',
      'src/__tests__/main.test.js',
    ])
  }
})