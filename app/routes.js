var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection); 
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var urlencodedparser = bodyParser.urlencoded({extended:false})


module.exports = function(app,passport) {

    
    app.get('/',isLoggedIn,function(req,res){
        var row = [];
        var row2=[];
        connection.query('select * from users where id = ?',[req.user.id], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                        
                    }  
                }
                console.log(row);
                
            }

            res.render('index.ejs', {rows : row}); // user.ejs ye gönderiyoruz . 
        });
    });


    app.post("/email",isLoggedIn,function(req,res){

        console.log(req.body);
        var row=[];
        var code="";
        var email="";
        connection.query('select * from users where id = ?',[req.user.id], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                        code =  bcrypt.hashSync(rows[i].username, null, null)
                        console.log(rows[i].username);
                        console.log(code);
                        email = rows[i].username;
                        
                    }  
                }
                console.log(row);
                
            }

            connection.query("UPDATE users SET code='"+code+"' WHERE id='"+req.user.id+"'");
            sendMail(email,code);
        });
        

    });

    app.get("/verification/:code",isLoggedIn,function(req,res){
        console.log("burda");
        var code = req.params.code;
        var row = [];

        connection.query('select * from users where code = ?',[code], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    connection.query("UPDATE users set verification = '"+1+"' where code = '"+code+"'");
                    res.redirect("/");
                }
                else{
                    res.redirect("/error");
                }
                console.log(row);
                
            }

           
        });
    });

    app.get('/error',function(req,res){

        res.render("error.ejs");

    });

    app.get('/login', function(req, res) {

        res.render('login.ejs',{ message: req.flash('loginMessage') });

    });

    app.get('/signup', function(req, res){
        res.render('signup.ejs',{message: req.flash('message')});
      });

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/login',
            failureRedirect: '/signup',
            failureFlash : true 
    }));

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', 
            failureRedirect : '/login',
            failureFlash : true 
        }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


};

function sendMail(mail_adress,code){

    var mail=mail_adress;
    var code=code;

    console.log(mail,code);

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '**',
        pass: '***'
      }
    });
    var mailOptions = {
      from: 'secretininfo@gmail.com',
      to: mail,
      subject: 'click this button',
      text: 'That was easy!',

      html: " <a href='http://127.0.0.1/verification/"+code+"'> http://127.0.0.1/verification/"+code+"  </a> "
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

}

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/login');
}

