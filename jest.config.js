module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}', '<rootDir>/frontend/tests/**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/frontend/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/$1'
  }
};
