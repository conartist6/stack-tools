const base = require('../../fixtures/error.js');

const { TestError, testErrorMessage, testErrorHeader } = base;

const nativeFrame = { call: null, site: { type: 'native' } };
const nativeFrameStr = '    at native';
const fileFooFrame = { call: null, site: { type: 'path', path: 'foo.js', line: 1, column: 1 } };
const fileFooFrameStr = '    at foo.js:1:1';

const testErrorFrames = [fileFooFrame, nativeFrame];
const testErrorFramesStr = [fileFooFrameStr, nativeFrameStr].join('\n');
const testErrorStack = `${testErrorHeader}\n${testErrorFramesStr}`;

const testError = new TestError(testErrorMessage);

testError.stack = testErrorStack;

module.exports = {
  ...base,
  nativeFrame,
  nativeFrameStr,
  fileFooFrame,
  fileFooFrameStr,
  testErrorFrames,
  testErrorFramesStr,
  testErrorStack,
  testError,
};
