const fs = require('fs').promises;

const PATH = './src/talker.json';
const leitorJSON = async () => {
  const response = await fs.readFile(PATH, 'utf-8');
  const talkerJSON = JSON.parse(response);
  return talkerJSON;
};

module.exports = {
    leitorJSON,
};
