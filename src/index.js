const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

const { validateToken,
    validateName,
    validateAge,
    validateTalk,
    validateRate } = require('./utils/validateUser');
const { leitorJSON } = require('./utils/promisse');

const talkerValidate = [validateToken, validateName, validateAge, validateTalk, validateRate];
const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const creatToken = () => crypto.randomBytes(8).toString('hex');

const escritorJSON = async (pathname, data) => {
  console.log(data);
  const updatedData = JSON.stringify(data);
  await fs.writeFile(path.resolve(__dirname, pathname), updatedData);
}; // com ajuda da alinegrance

const loginValidate = (req, res, next) => { //*
  const { email, password } = req.body;
  const validEmailRex = /\S+[@]\w+[.]\S+/;
  if (!email) {
    return res.status(400).send({ message: 'O campo "email" é obrigatório' });
  } if (!validEmailRex.test(email)) {
    return res.status(400).send({ message: 'O "email" deve ter o formato "email@email.com"' });
  } if (!password) {
    return res.status(400).send({ message: 'O campo "password" é obrigatório' });
  } if (password.length < 6) {
    return res.status(400).send({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};

const PATH = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  const talker = await leitorJSON();
  return res.status(200).json(talker);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talker = await leitorJSON();
  const findId = talker.find((talkerID) => talkerID.id === Number(id));
  if (!findId) {
    return res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(HTTP_OK_STATUS).json(findId);
});

app.post('/login', loginValidate, (req, res) => {
  const token = creatToken();
  res.status(200).send({ token });
});

app.post('/talker', talkerValidate, async (req, res) => {
  const talker = await leitorJSON();
  const talkerObjNw = { id: talker.length + 1, ...req.body };
  talker.push(talkerObjNw);
  await escritorJSON(PATH, talker);
  res.status(201).json(talkerObjNw);
});

app.put('/talker/:id', talkerValidate, async (req, res) => {
  const { id } = req.params;
  const editTalker = { id: Number(id), ...req.body };
  const talker = await leitorJSON();
  const talkerId = talker.find((talk) => talk.id === Number(id));
  talker.splice(Number(talkerId), 1, editTalker);
  await escritorJSON(PATH, talker);
  return res.status(200).json(editTalker);
});

app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const talker = await leitorJSON();
  const filterTalker = talker.filter((talk) => talk.id !== Number(id));
  await escritorJSON(PATH, filterTalker);
  res.status(204).end();
});

/* app.get('/talker/search', validateToken, async (req, res) => {
  const { q } = req.query;
  const talker = await leitorJSON();
  const filterTalker = talker.filter((talk) => talk.name.includes(q));
  if (!q || q.length === 0) {
    return res.status(200).json(talker);
  }
  return res.status(200).json(filterTalker);
});
 */
app.listen(PORT, () => {
  console.log('O PAI TA ON');
});
