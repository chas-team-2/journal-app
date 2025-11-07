/** @type {import("jest").Config} **/
module.exports = {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {}],
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};
