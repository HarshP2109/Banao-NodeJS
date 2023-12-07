const express = require('express');
const bodyParser = require("body-parser");
const app = express();
var nodemailer = require('nodemailer');
const session = require('express-session');

// var randomOTP,emailers;

require('dotenv').config()

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var database = [];

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SEND_EMAIL,
      pass: process.env.SEND_PASS
    }
  });
  

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  });



app.post('/validate', (req, res) => {

  let l_email = req.body.loginemail;
  let l_pass = req.body.loginpass;

  
  let r_email = req.body.registeremail;
  let r_name = req.body.registername;
  let r_num = req.body.registernumber;

  if((l_email!=undefined)&&(l_pass!=undefined)){        //login
    let LoginUser = {
      "Email": l_email,
      "Password": l_pass
    }
    console.log("Login");
    let n = database.length;
    if(n>0){
    for(let i =0 ;i<n;i++){
        if(database[i].Email == LoginUser.Email){
            if(database[i].Password == LoginUser.Password)
            res.redirect("/final");
            else
            res.redirect("/");
    }
    else{
        console.log("failll");
        res.redirect("/");
    }

  }
}

}
  else if((r_email!=undefined)&&(r_num!=undefined)&&(r_name!=undefined)){                                             //register
    let RegisterUser = {
      "Name" : r_name,
      "Password" : r_num,
      "Email" : r_email
    }
    console.log("Register");
    database.push(RegisterUser);
    res.redirect("/final");
  }

  console.log(database);
  // let login_email = req.body.login-email;
  // console.log(login_email,login_pass);
});


  app.get('/final', (req, res) => {
    res.send("FInalllll")
  });


  app.get('/emailer', (req, res) => {
    res.sendFile(__dirname + '/emailer.html')
  });

app.post('/emailer', (req, res) => {
    let emailers = req.body.loginemail;
    req.session.EMAIL = emailers;
    if((emailers=="")||(emailers==undefined)){
        console.log("Error");
        res.redirect('/');
      }
    else{
       let randomOTPs = generateOTP();
       req.session.OTPs = randomOTPs;
      let mailOptions = {
        from: process.env.SEND_EMAIL,
        to: emailers,
        subject: 'OTP for Login',
        text: 'Your One-Time Password (OTP) is '+ randomOTPs +' Please use this OTP to proceed with [action or verification process]. Do not share this OTP with anyone for security reasons.'
      };
    
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    
        console.log(randomOTPs);
        res.redirect("/otp")
        }
});

app.get('/otp', (req, res) => {
    res.sendFile(__dirname + '/otp.html')
  });

  
app.post('/otpverify', (req, res) => {
    // console.log(randomOTP);

    // let otp = randomOTPs;
    let otp = req.session.OTPs;
    // let enteredotp = req.body.otp;
    let a = req.body.ek.trim();
    let b = req.body.do.trim();
    let c = req.body.teen.trim();
    let d = req.body.char.trim();
    let e = req.body.paanch.trim();
    let enteredotp = a+b+c+d+e;
    console.log("Entered RandomOTP : "+otp);
    console.log("Entered OTP : "+enteredotp);
    console.log(enteredotp+"      "+otp);
    if (enteredotp!=otp) {
      res.redirect('/otp');
    }
    else{
      res.redirect('/confirm');
    }
  });



app.get("/confirm",(req,res)=>{
    res.sendFile(__dirname + '/passworder.html')
});


app.post("/confirm",(req,res)=>{
    
  let l_pass = req.body.loginpass;
  let n = database.length;
  if(n>0){
  for(let i =0 ;i<n;i++){
    //   if(database[i].Email == emailers){
      if(database[i].Email == req.session.EMAIL){
          database[i].Password = l_pass;
          console.log("Password Change Successfully");
          res.redirect("/final");
  }
}
  }
});


function generateOTP() {
    let otp = Math.floor(10000 + Math.random() * 90000);
    return otp;
  }


  app.listen(3000, () => {
    console.log('Server Working at :3000');
  });