 import mongoose from 'mongoose';

const ventasSchema = new mongoose.Schema({
  producto: String,
  cantidad: Number,
  precioUnitario: Number,
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios' }
});

const Ventas = mongoose.model('Ventas', ventasSchema);
export default Ventas;