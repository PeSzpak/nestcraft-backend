export default {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: '.*\\.e2e-spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    testTimeout: 30000,
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
    modulePaths: ['<rootDir>'],
  };