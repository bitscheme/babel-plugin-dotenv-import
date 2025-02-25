const process = require('process')

const {transformFileSync} = require('@babel/core')

const FIXTURES = '__tests__/__fixtures__/'
const env = Object.apply({}, process.env)

describe('babel-plugin-dotenv-import', () => {
  afterEach(() => {
    process.env = Object.apply({}, env)
  })

  it('should throw if the variable does not exist', () => {
    expect(() => transformFileSync(FIXTURES + 'variable-not-exist/source.js')).toThrow(
      '"foo" is not defined in any environment variables',
    )
  })

  it('should throw if default is imported', () => {
    expect(() => transformFileSync(FIXTURES + 'default-import/source.js')).toThrow(
      'Default import is not supported',
    )
  })

  it('should throw if wildcard is imported', () => {
    expect(() => transformFileSync(FIXTURES + 'wildcard-import/source.js')).toThrow(
      'Wildcard import is not supported',
    )
  })

  it('should load variables from .env', () => {
    const {code} = transformFileSync(FIXTURES + 'default/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should load variables from ENV_FILE environment variable ', () => {
    process.env.ENV_FILE = "__tests__/__fixtures__/env-file/.env.release"
    const {code} = transformFileSync(FIXTURES + 'env-file/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should allow importing variables already defined in the environment', () => {
    process.env.FROM_ENV = 'hello'

    const {code} = transformFileSync(FIXTURES + 'from-env/source.js')
    expect(code).toBe('console.log("hello");')
  })

  it('should prioritize environment variables over variables defined in .env', () => {
    process.env.API_KEY = 'i win'

    const {code} = transformFileSync(FIXTURES + 'default/source.js')
    expect(code).toBe('console.log("i win");\nconsole.log("username");')
  })

  it('should load custom env file', () => {
    const {code} = transformFileSync(FIXTURES + 'filename/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should support `as alias` import syntax', () => {
    const {code} = transformFileSync(FIXTURES + 'as-alias/source.js')
    expect(code).toBe('const a = "abc123";\nconst b = "username";')
  })

  it('should allow specifying a custom module name', () => {
    const {code} = transformFileSync(FIXTURES + 'custom-module/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should leave other imports untouched', () => {
    const {code} = transformFileSync(FIXTURES + 'unused/source.js')
    expect(code).toBe(
      "import path from 'path'; // eslint-disable-line import/no-unresolved\n\nconsole.log(path.join);",
    )
  })

  it('should throw when ENV_FILE defined but file is missing ', () => {
    process.env.ENV_FILE = ".nope.env"
    expect(() => transformFileSync(FIXTURES + 'no-env-file/source.js')).toThrow(
      '.nope.env file not found',
    )
  })

  it('should throw when using non-whitelisted env variables', () => {
    expect(() => transformFileSync(FIXTURES + 'whitelist/source.js')).toThrow(
      '"NOT_WHITELISTED" was not whitelisted',
    )
  })

  it('should throw when using blacklisted env variables', () => {
    expect(() => transformFileSync(FIXTURES + 'blacklist/source.js')).toThrow(
      '"BLACKLISTED" was blacklisted',
    )
  })

  it('should throw when trying to use a variable not defined in .env in safe mode', () => {
    process.env.FROM_ENV = 'here'

    expect(() => transformFileSync(FIXTURES + 'safe-error/source.js')).toThrow(
      '"FROM_ENV" is not defined',
    )
  })

  it('should load environment variables from .env in safe mode', () => {
    const {code} = transformFileSync(FIXTURES + 'safe-success/source.js')
    expect(code).toBe('console.log("1");')
  })

  it('should import undefined variables', () => {
    const {code} = transformFileSync(FIXTURES + 'undefined/source.js')
    expect(code).toBe('console.log(undefined);')
  })

  it('should not throw if .env does not exist in safe mode', () => {
    const {code} = transformFileSync(FIXTURES + 'safe-no-dotenv/source.js')
    expect(code).toBe('console.log(undefined);')
  })
})
