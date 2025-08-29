import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as libraryRoutes } from './routes/libraryRoutes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas
app.use('/api', libraryRoutes);

// Ruta de estado
app.get('/', (req, res) => {
  res.json({
    message: 'API Library operativa',
    status: 'OK'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});