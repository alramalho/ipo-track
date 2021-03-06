module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  coverageDirectory: "coverage",

  coverageProvider: "v8",

  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  }
};
