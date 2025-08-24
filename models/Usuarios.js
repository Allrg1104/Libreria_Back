import mongoose from 'mongoose';
/*Esquema usuario y admin */

const usuariosSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    rol: String
});

const Usuarios = mongoose.model('Usuarios', usuariosSchema);

export default Usuarios;