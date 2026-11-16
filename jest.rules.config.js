/**
 * Testes das Security Rules e do adaptador do Firestore contra o emulador.
 * Rodam fora do preset do Expo (ambiente Node puro, SDK web do Firebase).
 * Use: npm run test:rules (precisa de Java para o emulador).
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/firestore-tests'],
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 20000,
};
