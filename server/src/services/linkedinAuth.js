const fs = require('fs');
const path = require('path');

const STORAGE_STATE_PATH = process.env.LINKEDIN_STORAGE_STATE_PATH
  ? path.resolve(process.env.LINKEDIN_STORAGE_STATE_PATH)
  : path.resolve(__dirname, '../../..', 'linkedin-auth.json');

function getLinkedInStorageStatePath() {
  return STORAGE_STATE_PATH;
}

function hasLinkedInStorageState() {
  return fs.existsSync(STORAGE_STATE_PATH);
}

module.exports = {
  getLinkedInStorageStatePath,
  hasLinkedInStorageState,
};
