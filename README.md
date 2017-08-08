# Nodejs-Send-Verification-Mail-Project-with-gmail-and-mysql
<h2>install</h2>

<h3>config/database.js</h3>
<pre>
module.exports = {
    'connection': {
        'host': '127.0.0.1', // local or ip adress .
        'user': 'root', // mysql user name
        'password': 'password', // password 
        'database': 'dbname'// database name .
    },
	'database': 'dbname',
    
};
</pre>


<pre>npm install </pre>
<pre>node server.js</pre>

<h2>How is running</h2>

<h4>post email </h4>
<pre>
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
</pre>

<h4>mail function</h4>
<pre>
function sendMail(mail_adress,code){

    var mail=mail_adress;
    var code=code;

    console.log(mail,code);

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_gmal_adress@gmail.com',
        pass: 'your_gmail_pass'
      }
    });
    var mailOptions = {
      from: 'from_gmail_adres',
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
</pre>
<h4>verification code </h4>
<pre>
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
</pre>
<h4>index.ejs scripts</h4>
<pre>
$(document).ready(function(){
        $('#sendemail').click(function(){
        $("#sendemail").hide();
        var data = {};
        data.userID = '<%=rows.id%>';
        $.ajax({
            url: '/email',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(data) {
                console.log(data);
            }
        });
    });
});
</pre>
