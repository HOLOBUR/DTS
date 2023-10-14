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

const cityDatabase = mongoose.createConnection(process.env.MONGODB_URI + process.env.CITYNAME + process.env.MONGODB_AUTH, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const webcamSchema = new mongoose.Schema({
  name: String,
  isOK: Boolean,
  visible: Boolean,
  isVideo: Boolean,
  url: String,
  location: {
    Longitude: Number,
    Latitude: Number,
    Height: Number
  },
  additionalInfo: {}
});

const webcamModel = cityDatabase.model('webcam', webcamSchema, 'webcams')

app.get('/webcam', checkAuthorization, async (req, res) => {
  try {
    // Recupera la lista de campos que se deben devolver desde la cabecera "X-Fields"
    const fieldsHeader = req.get('X-Fields');

    if (!fieldsHeader) {
      return res.status(400).send('Falta el encabezado X-Fields en la solicitud.');
    }

    // Convierte la lista de campos en un objeto de proyección
    const fieldsArray = fieldsHeader.split(',');
    const projection = fieldsArray.reduce((obj, field) => {
      obj[field] = 1; // 1 indica que se incluirá este campo
      return obj;
    }, {});

    const conditions = { isOK: true, visible: true };

    // Realiza la consulta con las condiciones y la proyección de campos
    const configData = await webcamModel.find(conditions, projection);
    res.json(configData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la configuración desde MongoDB');
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js escuchando en el puerto ${port}`);
});
