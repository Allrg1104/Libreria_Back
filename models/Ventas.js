import mongoose from 'mongoose';

const ventasSchema = new mongoose.Schema({
  producto: String,
  cantidad: Number,
  precioUnitario: Number,
  total: Number,
  fechaReg: { type: Date, default: Date.now },
  id_vendedor: String,
  name_vendedor: String
});

const Ventas = mongoose.model('Ventas', ventasSchema);
export default Ventas;