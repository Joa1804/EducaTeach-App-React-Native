// Mocks globais aplicados antes de cada arquivo de teste.
// expo-sqlite e expo-crypto dependem de módulos nativos; nos testes eles são
// substituídos por implementações reais em Node (node:sqlite e node:crypto),
// para que as queries e os hashes sejam exercitados de verdade.
jest.mock('expo-sqlite', () => jest.requireActual('./mocks/expo-sqlite'));
jest.mock('expo-crypto', () => jest.requireActual('./mocks/expo-crypto'));
