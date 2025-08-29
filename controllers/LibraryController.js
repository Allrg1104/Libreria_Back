import Usuarios from '../models/Usuarios.js';
import Ventas from '../models/Ventas.js';
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

/*Listar usuario*/

export const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuarios.find(); // ⬅ nombre en minúsculas
    res.json(usuarios); // ✅ así sí devuelve un arreglo directamente
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

/*Craar Una Venta*/

export const createVenta = async (req, res) => {
  try {
    let { producto, cantidad, precioUnitario } = req.body;

    // Asegurarse que sean números
    cantidad = Number(cantidad);
    precioUnitario = Number(precioUnitario);

    const total = cantidad * precioUnitario;

    const nuevaVenta = new Ventas({ 
      producto, 
      cantidad,
      precioUnitario,
      total
    });

    await nuevaVenta.save();
    res.status(201).json(nuevaVenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la venta' });
  }
};


/*Listar ventas*/

export const getVenta = async (req, res) => {
  try {
    const ventas = await Ventas.find(); // Obtiene todas las ventas sin filtro
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error en el servidor al obtener las ventas' });
  }
};