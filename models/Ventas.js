 import mongoose from 'mongoose';

const ventasSchema = new mongoose.Schema({
  producto: String,
  cantidad: Number,
  precioUnitario: Number,
  total: Number,
  fechaReg: { type: Date, default: Date.now },
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', require:true}
});

const Ventas = mongoose.model('Ventas', ventasSchema);
export default Ventas;