const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
var cookieParser = require('cookie-parser');
const port = 3000;
id="googleSignIn"
onclick="signOut();"
// koneksi ke database mongodb
require('./utils/db');
// ambil model db
const UserLogin = require('./models/userLogin')

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '224457091129-ejnqbdagof0l9o73qp047qopbrri8smq.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Middleware
// Gunakan ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.static('src'));
app.use(express.json());
app.use(cookieParser());

// Halaman login
app.get('/', isLoggin, (req, res) => {
  res.render('index', {title: 'Masuk-RizaKode',layout: 'layouts/layout-utama'});
});


// Halaman home 
// Hanya dapat diakses manakala user berhasil login
app.get('/home',checkAuthenticated, async (req,res)=>{
  let user = req.user;
  await UserLogin.insertOne({
    name:req.user.name,
    email:req.user.email
  })
  res.render('home', {title: 'Welcome!!!', user, layout: 'layouts/layout-utama'});
});

// proses 
app.post('/', (req,res)=>{
  let token = req.body.token;
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    

    // console.log(payload);
  }
  verify()
  .then(()=>{
    res.cookie('session_token', token);
    res.send('success');
  })
  .catch(console.error);
});

// Setiap kali logout, bersihkan cookie
app.get('/logout', (req,res)=>{
  res.clearCookie('session_token');
  res.redirect('/');
});


// Buat fungsi kalau user berhasil login
function isLoggin(req, res, next){
  let token = req.cookies['session_token'];
  if(!token){
    next()
  }else{
    res.redirect('/home');
  }
  
}

// Rute untuk menangani 
// Url selain yang sudah dibuat
app.use('/', (req,res)=>{
  res.send('Ini adalah halaman yang menangani route selain route yang diatas!!');
})

// Cek apakah user berhasil login atau tidak
function checkAuthenticated(req, res, next){

  let token = req.cookies['session_token'];
  

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then( ()=>{
        req.user = user;
        console.log(req.user)
        // simpan informasi userlogin ke mongodb
        // 

        next()
    })
    .catch(err=>{
        res.redirect('/')
    })
  

}

app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});