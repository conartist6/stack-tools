const { Grammar } = require('nearley');
const isError = require('iserror');
const { parseError: baseParseError, printError: basePrintError } = require('stack-tools');

const { parseUnambiguous } = require('./internal/nearley/util.js');
const CompiledErrorGrammar = require('./internal/nearley/error.js');
const { parseHeader } = require('./internal/header.js');
const { parseFrame, isInternalFrame } = require('./frame.js');
const { visit, isNode } = require('./visit.js');

const ErrorsGrammar = Grammar.fromCompiled(CompiledErrorGrammar);
const ErrorGrammar = Grammar.fromCompiled({ ...CompiledErrorGrammar, ParserStart: 'Error' });

function __parseError(error, options = {}) {
  const { strict = false, frames = true } = options;
  const {
    type,
    header,
    frames: parsedFrames,
  } = strict ? parseUnambiguous(ErrorGrammar, error) : parseUnambiguous(ErrorsGrammar, error)[0];

  return {
    type,
    ...parseHeader(header),
    frames: frames && parsedFrames ? parsedFrames.map((frame) => parseFrame(frame)) : undefined,
  };
}

function parseError(error, options = {}) {
  const { strict = false, frames = true } = options;
  if (isError(error)) {
    if (strict && (!frames || !error.stack)) {
      const parsed = baseParseError(error, { frames });
      parsed.prefix = undefined;
      return parsed;
    } else {
      return __parseError(error.stack, options);
    }
  } else if (typeof error === 'string') {
    return __parseError(error, options);
  } else if (isNode(error)) {
    return frames ? error : { ...error, frames: undefined };
  } else {
    throw new TypeError(
      'error argument to parseError must be an Error, string, or parseError(error)',
    );
  }
}

function printError(error, options = {}) {
  const { strict, frames } = options;
  if (isError(error) && strict) {
    return basePrintError(error, { frames });
  } else {
    return visit(parseError(error, options));
  }
}

function __cleanError(error, predicate) {
  const { frames } = error;
  const cleaned = frames.filter((frame) => !predicate(frame));
  if (frames.length && !cleaned.length) {
    cleaned.push({ type: 'OmittedFrame' });
  }
  error.frames = cleaned;
  return error;
}

function cleanError(error, predicate = isInternalFrame) {
  if (typeof error === 'string') {
    return printError(__cleanError(parseError(error), predicate));
  } else {
    return __cleanError(error, predicate);
  }
}

module.exports = {
  parseError,
  printError,
  cleanError,
};
