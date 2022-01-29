// module dotenv
const dotenv = require('dotenv')
// import module mongoose
const mongoose = require('mongoose');


// setup env
dotenv.config({path: './config/config.env'})
// koneksikan ke db mongodb
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

// const Kontak = mongoose.model('kontaks',{
//         nama:{
//             type:'string',
//             required:true
//         },
//         nohp:{
//             type: 'string',
//             required:true
//         },
//         email:{
//             type:'string'
//         }
// })

// Menambahkan 1 data
// const kontak1 = new Kontak({
//     nama:"qidan",
//     nohp:"0811897654323",
//     email:"qidan@gmail.com"
// })

// Menyimpan 1 data
// kontak1.save().then((hasil)=>{
//     console.log(hasil)
// })