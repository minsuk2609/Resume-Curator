const { diffWords } = require('diff');

function generateDiff(original, tailored) {
  return diffWords(original, tailored).map(({ value, added, removed }) => ({
    value,
    added: added || false,
    removed: removed || false,
  }));
}

module.exports = { generateDiff };
