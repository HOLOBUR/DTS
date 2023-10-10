const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Habilita CORS
app.use(cors());
app.use(bodyParser.json());

// Conectar a MongoDB Atlas usando Mongoose
//mongoose.connect(process.env.MONGODB_URI, {
mongoose.connect("mongodb+srv://dts-server:ZOW24osi@dts-server.t8ah0ib.mongodb.net/sample_analytics?authMechanism=SCRAM-SHA-1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB Atlas', err);
  });

// Define el modelo de datos de configuración en MongoDB
const configSchema = new mongoose.Schema({
  key: String,
  value: String,
});
const Config = mongoose.model('Config', configSchema);

// Middleware para verificar el encabezado "Authorization"
function checkAuthorization(req, res, next) {
  const authHeader = req.headers['authorization'];
  const apiKey = process.env.API_KEY;

  if (authHeader && authHeader === `Bearer ${apiKey}`) {
    next();
  } else {
    res.status(401).send('Acceso no autorizado');
  }
}

const schema = new mongoose.Schema({
  account_id: Number,
  limit: Number,
  products: [String], // El campo "products" es un array de strings
});

const Accounts = mongoose.model('accounts', schema);

// Ruta para obtener todas las propiedades
app.get('/properties', async (req, res) => {
  try {
    const properties = await Accounts.find();
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las propiedades desde MongoDB');
  }
});

// Ruta para obtener la configuración desde MongoDB
app.get('/config', checkAuthorization, async (req, res) => {
  try {
    const configData = await Config.find();
    res.json(configData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la configuración desde MongoDB');
  }
});

// Ruta para actualizar la configuración en MongoDB
app.post('/config', checkAuthorization, async (req, res) => {
  try {
    const configData = req.body;

    // Actualiza o crea un nuevo documento de configuración
    await Config.findOneAndUpdate({}, configData, { upsert: true });

    res.status(200).send('Configuración actualizada con éxito');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al guardar la configuración en MongoDB');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js escuchando en el puerto ${port}`);
});
