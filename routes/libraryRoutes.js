import express from 'express';
import {loginUser,createUser,getUsuario,createVenta,getVenta} from '../controllers/LibraryController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/newUser', createUser);
router.get('/usuarios', getUsuario);
router.post('/newventa', createVenta);
router.get('/ventas', getVenta);
<<<<<<< HEAD
=======

router.post('/', generateChatResponse);
router.get('/history/:userId', getConversationHistory);
>>>>>>> 7a7fe05212e70a42e0d1065b5aef0897daef9257

export { router };
