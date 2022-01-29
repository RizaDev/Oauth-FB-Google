// import modul mongoose
const mongoose = require('mongoose')

// schema db 
const UserLogin = mongoose.model('usersLogin', {
    userId:{
        type:"string",
        required:true
        
    },
    nama:{
        type:"string",
        required:true
        
    },
    picture:{
        type:"string",
        
    },
    email:{
        type:"string",
        required:true
        
    }
})


module.exports = {UserLogin}