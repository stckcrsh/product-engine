export default {
  displayName: 'rete-pe-nodes',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/rete/nodes',
  setupFilesAfterEnv: ['<rootDir>/setup-env.js'],
};
