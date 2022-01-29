// import module
// express
const express = require('express')
// express ejs layouting
const expressLayouts = require('express-ejs-layouts')
// express session
const session = require('express-session')
// module konfigurasi enviroment
const dotenv = require('dotenv')
// jalankan koneksi databasse
require('./utils/db')
// ambil model collection database
const {UserLogin} = require('./models/userLogin')
// module passport
const passport = require('passport')
// google passport untuk oauth dengan google
const GoogleStrategy = require('passport-google-oauth20')
// facebook passport untuk oauth dengan facebook
const FacebookStrategy = require('passport-facebook').Strategy



// setup express
const app = express()
// setup env
dotenv.config({path:'./config/config.env'})
// port server
const port = process.env.PORT


// setup templating engine dengan ejs
app.set('view engine', 'ejs')
// gunakan ejs templating
app.use(expressLayouts)
// izinkan akses folder src
app.use(express.static('src'))
// parse body
app.use(express.urlencoded({extended:true}))
// session
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
    //   store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Konfigurasi module Google Oauth2
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:'/auth/google/callback'
        },
        async (token, refreshToken, profile, done)=>{
            // dapatkan user data dari google
            // console.log(profile);
            const user_login = {
                userId:profile.id,
                nama: profile.displayName,
                picture: profile.photos[0].value,
                email:profile.emails[0].value
            }
            try{
                // temukan user di database
                let user = await UserLogin.findOne({userId: profile.id})
                // jika user sudah ada di db, maka jgn disave
                if(user){
                    done(null, user)
                }else{
                    // jika belum ada, maka save
                    user = await UserLogin.create(user_login)
                    done(null,user)
                }
            } catch(err){
                console.error(err)
            }
        }

    )
)

// Konfigurasi Oauth dengan Facebook
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: 'https://8437-182-1-89-176.ngrok.io/auth/facebook/callback',
            profileFields   : ['id','displayName','name','gender','picture.type(large)','email']
        },
        async (accessToken, refreshToken, profile, done)=>{
            // dapatkan user data dari google
            //  console.log(profile);
            const user_login = {
                userId:profile.id,
                nama: profile.displayName,
                picture: profile.photos[0].value,
                email:profile.emails[0].value
            }
            try{
                // temukan user di database
                let user = await UserLogin.findOne({userId: profile.id})
                // jika user sudah ada di db, maka jgn disave
                if(user){
                    done(null, user)
                }else{
                    // jika belum ada, maka save
                    user = await UserLogin.create(user_login)
                    done(null,user)
                }
            } catch(err){
                console.error(err)
            }
        }
    
    )
)

// used to serialize the user for the session
passport.serializeUser((user, done) => {
    done(null, user.id)
})


// used to deserialize the user
passport.deserializeUser((id, done) => {
    UserLogin.findById(id, (err, user) => done(err, user))
})

// Halaman login
// Hanya bisa diakses kalau user belum terauthentikasi
app.get('/',ensureGuest, (req, res) => {
    res.render('index',
     {
         title: 'Masuk-RizaKode',
         layout: 'layouts/layout-utama'
        })
})

// Halaman Home
// Hanya dapat diakses manakala user berhasil login
app.get('/home',ensureAuth, async (req,res)=>{
    
    
    // console.log(req.user)
    res.render('home', 
        {
            title: 'Welcome!!!',
            user:req.user,
            layout: 'layouts/layout-utama'
        }
    );
})

// fungsi untuk memastikan kalau user login
function ensureAuth(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}
// fungsi untuk memastikan jika user belum login
function ensureGuest(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/home')
}

// Proses menangani autentikasi google
app.get('/auth/google', 
    passport.authenticate('google',
        {
            scope:['profile','email']
            
        }
    )
)
// Prosess menangani callback,jika lolos auth maka
// akan diarahkan ke halaman login
app.get('/auth/google/callback', 
    passport.authenticate('google',
        {
            failureRedirect: '/'
        }
    )
    ,(req,res)=>{
        res.redirect('/home')
    }
)
// Proses menangani autentikasi facebook
app.get('/auth/facebook', 
    passport.authenticate('facebook',{
        scope: 'email'
    })
)
// Prosess menangani callback,jika lolos auth maka
// akan diarahkan ke halaman login
app.get('/auth/facebook/callback', 
    passport.authenticate('facebook',
        {
            // successRedirect:'/home',
            failureRedirect: '/',
        }
    )
    ,(req,res)=>{
        res.redirect('/home')
    }
)

// proses menangani logout
app.get('/auth/logout', (req,res)=>{
    req.logout()
    res.redirect('/')
})

// Jalankan server express
app.listen(port, ()=>{
    console.log(`server berjalan di http://localhost:${port}`)
})



