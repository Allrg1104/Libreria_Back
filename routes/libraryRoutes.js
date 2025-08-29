import express from 'express';
import {loginUser,createUser,getUsuario,createVenta,getVenta,obtenerDashboard} from '../controllers/LibraryController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/newUser', createUser);
router.get('/usuarios', getUsuario);
router.post('/newventa', createVenta);
router.get('/ventas', getVenta);
router.get("/dashboard", obtenerDashboard);

export { router };
