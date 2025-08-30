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
      let { producto, cantidad, id_vendedor,nameVendedor,precioUnitario } = req.body;

      // Asegurarse que sean números
      cantidad = Number(cantidad);
      precioUnitario = Number(precioUnitario);

      const total = cantidad * precioUnitario;

      const nuevaVenta = new Ventas({ 
        producto, 
        cantidad,
        id_vendedor,
        nameVendedor,
        precioUnitario,
        total
      });

      await nuevaVenta.save();
      res.status(201).json({ success: true, venta: nuevaVenta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la venta' });
    }
  };


/*Listar ventas*/

export const getVenta = async (req, res) => {
  try {
    const ventas = await Ventas.find().populate("id_vendedor", "name email rol");
    //const ventas = await Ventas.find(); // Obtiene todas las ventas sin filtro
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error en el servidor al obtener las ventas' });
  }
};

/*Obtener DashBoard*/

export const obtenerDashboard = async (req, res, next) => {
  try {
    // Traer ventas y poblar con el usuario real
    const ventas = await Ventas.find().populate("id_vendedor");

    // Totales globales
    const totalCantidad = ventas.reduce((sum, v) => sum + v.cantidad, 0);
    const totalValor = ventas.reduce((sum, v) => sum + v.total, 0);

    // Metas y progreso (puedes parametrizar estos valores)
    const metas = {
      cantidad: 500,
      valor: 2000000,
      progresoCantidad: totalCantidad,
      progresoValor: totalValor,
    };

    // Top productos
    const productosPorCantidad = {};
    const productosPorValor = {};

    ventas.forEach((v) => {
      if (!productosPorCantidad[v.producto]) {
        productosPorCantidad[v.producto] = { producto: v.producto, cantidad: 0 };
      }
      if (!productosPorValor[v.producto]) {
        productosPorValor[v.producto] = { producto: v.producto, valor: 0 };
      }
      productosPorCantidad[v.producto].cantidad += v.cantidad;
      productosPorValor[v.producto].valor += v.total;
    });

    const topPorCantidad = Object.values(productosPorCantidad)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    const topPorValor = Object.values(productosPorValor)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    // Ventas por usuario y producto
    const ventasPorUsuario = {};
    ventas.forEach((v) => {
      const usuario = v.id_vendedor?.name || "Desconocido"; // 🔹 ahora usamos v.id (relación con Usuarios)
      if (!ventasPorUsuario[usuario]) {
        ventasPorUsuario[usuario] = {};
      }
      if (!ventasPorUsuario[usuario][v.producto]) {
        ventasPorUsuario[usuario][v.producto] = {
          producto: v.producto,
          cantidad: 0,
          valor: 0,
        };
      }
      ventasPorUsuario[usuario][v.producto].cantidad += v.cantidad;
      ventasPorUsuario[usuario][v.producto].valor += v.total;
    });

    res.json({
      metas,
      topPorCantidad,
      topPorValor,
      ventasPorUsuario,
    });
  } catch (error) {
    next(error);
  }
};