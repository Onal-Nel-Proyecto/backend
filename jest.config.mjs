/**
 * Jest configuration for ESM project.
 * 
 * - transform: {} disables babel-jest — Jest handles ESM syntax natively
 * - testEnvironment: 'node' for backend API testing
 * - extensionsToTreatAsEsm: ['.js'] tells Jest which files are ESM
 * - moduleNameMapper ensures consistent .js extension resolution
 */
export default {
  transform: {},
  testEnvironment: 'node',
};
