const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser'); // Agrega el módulo body-parser
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Habilita CORS
app.use(cors());
app.use(bodyParser.json()); // Habilita el uso de JSON en las solicitudes

// Middleware para verificar el encabezado "Authorization"
function checkAuthorization(req, res, next) {
  const authHeader = req.headers['authorization'];
  const apiKey = process.env.API_KEY; // Debes configurar tu clave de API en variables de entorno

  if (authHeader && authHeader === `Bearer ${apiKey}`) {
    // La solicitud está autorizada, continúa
    
    next();
  } else {
    // La solicitud no está autorizada, envía una respuesta de error
    res.status(401).send('Acceso no autorizado');
  }
}


// Aplicar el middleware de autorización a las rutas que manejan config.json
app.get('/config', checkAuthorization, (req, res) => {
  const configFilePath = path.join(__dirname, 'config.json');
  
  // Leer el archivo config.json desde el sistema de archivos
  fs.readFile(configFilePath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el archivo config.json');
    } else {
      // Configurar las cabeceras CORS para permitir solicitudes desde cualquier origen
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Establecer el tipo de contenido como JSON
      res.setHeader('Content-Type', 'application/json');
      
      // Enviar el archivo config.json como respuesta
      res.send(data);
    }
  });
});

app.post('/config', checkAuthorization, (req, res) => {
  const configFilePath = path.join(__dirname, 'config.json');
  
  // Obtener el contenido JSON del cuerpo de la solicitud
  const configData = JSON.stringify(req.body, null, 2);
  
  // Escribir el contenido en el archivo config.json
  fs.writeFile(configFilePath, configData, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al guardar el archivo config.json');
    } else {
      // Enviar una respuesta exitosa
      res.status(200).send('Archivo config.json guardado con éxito');
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js escuchando en el puerto ${port}`);
});
