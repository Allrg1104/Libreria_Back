 import mongoose from 'mongoose';

const ventasSchema = new mongoose.Schema({
  producto: String,
  cantidad: Number,
  precioUnitario: { type: Number, default: 50000},
  fechaReg: { type: Date, default: Date.now },
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios' }
});

// Antes de guardar, calcular el total automáticamente
ventasSchema.pre("save", function (next) {
  this.total = this.cantidad * this.precioUnitario;
  next();
});

const Ventas = mongoose.model('Ventas', ventasSchema);
export default Ventas;