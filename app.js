const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Middleware para JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// "Base de datos" simulada
let characters = [
  { id: 1, name: 'Cloud Strife', job: 'Soldier', weapon: 'Buster sword', level: 25 },
  { id: 2, name: 'Tifa Lockhart', job: 'Fighter', weapon: 'Leather gloves', level: 22 },
  { id: 3, name: 'Aerith Gainsborough', job: 'Mage', weapon: 'Magic staff', level: 20 }
];

// Configuración de Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/* =======================
   RUTAS API REST /characters
   ======================= */

// GET /characters – todos los personajes
app.get('/characters', (req, res) => {
  res.json(characters);
});

// GET /characters/:id – personaje por ID
app.get('/characters/:id', (req, res) => {
  const id = Number(req.params.id);
  const character = characters.find(c => c.id === id);

  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json(character);
});

// POST /characters – crear nuevo personaje
app.post('/characters', (req, res) => {
  const newChar = req.body;

  // Cuerpo vacío
  if (!newChar || Object.keys(newChar).length === 0) {
    return res.status(400).json({ error: 'Body is empty' });
  }

  const { id, name, job, weapon, level } = newChar;

  // ID o nombre repetidos
  const exists = characters.some(
    c => c.id === id || c.name === name
  );
  if (exists) {
    return res.status(400).json({ error: 'ID or name already exists' });
  }

  // Nivel fuera de rango
  if (level < 1 || level > 99) {
    return res.status(400).json({ error: 'Level must be between 1 and 99' });
  }

  characters.push({ id, name, job, weapon, level });
  res.status(201).json({ message: 'Character created' });
});

// PUT /characters/:id – actualizar personaje
app.put('/characters/:id', (req, res) => {
  const id = Number(req.params.id);
  const updatedChar = req.body;

  // Cuerpo vacío
  if (!updatedChar || Object.keys(updatedChar).length === 0) {
    return res.status(400).json({ error: 'Body is empty' });
  }

  const index = characters.findIndex(c => c.id === id);

  // ID no existe
  if (index === -1) {
    return res.status(404).json({ error: 'Character does not exist' });
  }

  const { id: newId, name, job, weapon, level } = updatedChar;

  // ID o nombre repetidos con otro personaje
  const duplicate = characters.some(
    c => (c.id === newId || c.name === name) && c.id !== id
  );
  if (duplicate) {
    return res.status(400).json({ error: 'ID or name already exists' });
  }

  // Nivel fuera de rango
  if (level < 1 || level > 99) {
    return res.status(400).json({ error: 'Level must be between 1 and 99' });
  }

  // Actualizar
  characters[index] = { id: newId, name, job, weapon, level };

  // 204 sin contenido
  res.status(204).send();
});

// DELETE /characters/:id – borrar personaje
app.delete('/characters/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = characters.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Character does not exist' });
  }

  characters.splice(index, 1);
  res.status(204).send();
});

/* =======================
   VISTAS PUG
   ======================= */

// GET /index – mensaje bienvenida
app.get('/index', (req, res) => {
  res.render('index', { title: 'Welcome' });
});

// GET /list – lista de personajes
app.get('/list', (req, res) => {
  res.render('list', {
    title: 'Character list',
    characters
  });
});

// GET /new – formulario nuevo personaje
app.get('/new', (req, res) => {
  res.render('new', { title: 'New character' });
});

// POST /new – guardar desde formulario y volver a /list
app.post('/new', (req, res) => {
  const { id, name, job, weapon, level } = req.body;

  // Sin comprobación de errores (como dice el enunciado)
  characters.push({
    id: Number(id),
    name,
    job,
    weapon,
    level: Number(level)
  });

  res.redirect('/list');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 