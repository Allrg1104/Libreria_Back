import OpenAI from 'openai';
import Usuarios from '../models/Usuarios.js';
import Conversation from '../models/Conversation.js';
import transporter from '../config/mailConfig.js'; 
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Mapa de actividad global (se mantendrá entre invocaciones en Vercel)
const userActivityMap = new Map();

export function updateUserActivity(userId) {
  userActivityMap.set(userId, Date.now());
}


/*Login*/

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      const validateUser = await Usuarios.findOne({ email, password });

      if (validateUser) {
          console.log("Login exitoso para:", email);
          return res.json({
              success: true,
              message: 'Inicio de Sesion Exitoso!',
              user: {
                  _id: validateUser._id,  //Se agrega User _id.  
                  email: validateUser.email,
                  name: validateUser.name,
                  rol: validateUser.rol,
              },
          });
      } else {
          return res.status(400).json({ success: false, message: 'El usuario o contraseña no son correctos' });
      }
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

/*Crear usuario y admin*/
export const createUser = async (req, res) => {
  try {
    const { name, email, password, rol } = req.body; 

    const nuevoUsuario = new Usuarios({ 
      name, 
      email, 
      password, 
      rol
    });

    await nuevoUsuario.save();

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

/*Obtener Datos del Usuario */                                                //MODIFICADO

export const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuarios.find(); // ⬅ nombre en minúsculas
    res.json(usuarios); // ✅ así sí devuelve un arreglo directamente
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

///////////////////////////////////////////// Crear venta  /////////////////////////////////////////////////////////////////////

export const createVenta = async (req, res) => {
  try {
    let { producto, cantidad, precioUnitario} = req.body;

    const nuevaVenta = new Venta({ 
      producto, 
      cantidad,
      precioUnitario,
      fechaReg: new Date()
    });

    await nuevaVenta.save();
    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la venta' });
  }
};

///////////////////////////////////////////// Obtener las Ventas /////////////////////////////////////////////////////////////////////

export const getVenta = async (req, res) => {
  try {
    const ventas = await Venta.find(); // Obtiene todas las ventas sin filtro
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error en el servidor al obtener las ventas' });
  }
};


////////////////////////////////////////

//////////////////////////////////////// 

//////////////////////////////////////// 

//////////////////////////////////////// 

//////////////////////////////////////// 



// Configurar OpenAI con manejo de errores mejorado
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida');
  }
  openai = new OpenAI({ apiKey });
  console.log('✅ OpenAI configurado correctamente');
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
}

// Generar respuesta de ChatGPT con contexto del historial de conversaciones
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    updateUserActivity(userId);

    if (!prompt) return res.status(400).json({ error: 'El prompt es requerido' });
    
    const conversations = await Conversation.find().sort({ createdAt: -1 }).limit(10);
    const conversationContext = conversations.flatMap(conv => ([
      { role: "user", content: conv.prompt },
      { role: "assistant", content: conv.response }
    ]));

    // Llamada a la API de OpenAI con historial de conversaciones como contexto
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Eres una asistente de rumbas llamada “Sommer”, de 32 años de edad. Eres servicial, alegre, espontánea, carismática con un acento caleño y lenguaje juvenil. Los usuarios te preguntaran que hacer un viernes o los fines de semana en la noche en Cali. Quieren planes para salir con amigos. Sugerir 3 planes divertidos de rumba con amigos cuando te pregunten. Responder brevemente y directo, entusiasmada, informalidad moderada, sin groserías, segura de si y con tranquilidad. No puedes hablar mal de otros lugares, no puedes buscar comida, cosas para comprar, temas de estudio, bíblicos, terroristas,  no des concejos médicos ni opiniones personales. "
        },
        ...conversationContext, // Agregar historial de conversaciones
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    // Guardar la conversación en la base de datos
    const newConversation = new Conversation({ prompt, response,userId });
    await newConversation.save();
    
    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

export const getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      console.error("Error: userId no fue proporcionado en la solicitud");
      return res.status(400).json({ error: "El userId es requerido" });
    }

    // Obtener las últimas 10 conversaciones
    const conversations = await Conversation.find({ userId }).sort({ createdAt: -1 }).limit(10);

    // Transformar los datos para devolver solo el prompt y un resumen
    const conversationSummary = conversations.map(conv => ({
      prompt: conv.prompt,
      resumen: conv.response.slice(0, 100) + "..." // Limita la respuesta a 100 caracteres y añade "..."
    }));

    res.json(conversationSummary);
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    res.status(500).json({ error: "Error al obtener el historial de conversaciones" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userActivityMap.has(userId)) {
      userActivityMap.delete(userId);
      console.log(`👋 Usuario ${userId} cerró sesión manualmente`);
      
      // Enviar resumen reutilizando la función existente
      const summarySent = await generateAndSendSummary(userId, process.env.PORT);
      
      return res.json({ 
        success: true, 
        message: summarySent 
          ? 'Sesión cerrada y resumen enviado por correo' 
          : 'Sesión cerrada (pero no se pudo enviar el resumen)' 
      });
    } else {
      return res.json({ 
        success: true, 
        message: 'Sesión cerrada (usuario no tenía actividad registrada)' 
      });
    }
  } catch (error) {
    console.error('❌ Error durante el cierre de sesión:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al cerrar sesión' 
    });
  }
};

// Revisión de inactividad cada 1 minuto
export const generateAndSendSummary = async (userId, PORT) => {
  try {
    console.log(`⏳ Generando resumen para usuario ${userId}...`);
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const resumen = conversations.map(conv =>
      `🗨️ ${conv.prompt}\n💬 ${conv.response}`
    ).join('\n\n') || 'No hubo conversación registrada hoy.';

    //const { data: users } = await axios.get(`https://sommer-back-steel.vercel.app/api/chat/usuarios`); este fue el ultimo documentado
    //const { data: users } = await axios.get(`http://localhost:${PORT}/api/chat/usuarios`);
    const user = users.find(u =>
      u._id === userId || u._id?.toString() === userId || u.correo === userId
    );

    if (user && user.correo) {
      await sendSummaryEmail(user.correo, resumen); // Ahora sin pasar transporter
      return true;
    }
  } catch (error) {
    console.error('❌ Error generando o enviando resumen:', error);
    return false;
  }
};

export const sendSummaryEmail = async (to, resumen) => {
  try {
    await transporter.sendMail({
      from: `"Asistente Sommer" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Resumen de tu conversación con Sommer',
      text: resumen
    });
    console.log(`📧 Resumen enviado a ${to}`);
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    throw error; // Propaga el error para manejarlo arriba
  }
};