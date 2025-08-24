import express from 'express';
import {loginUser,createUser,generateChatResponse,getUsuario,getConversationHistory,logoutUser,createVenta,getVenta} from '../controllers/chatController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/newUser', createUser);
router.get('/usuarios', getUsuario);
router.post('/logout', logoutUser);
router.post('/newventa', createVenta);
router.post('/ventas', getVenta);

router.post('/', generateChatResponse);
router.get('/history/:userId', getConversationHistory);

export { router };
