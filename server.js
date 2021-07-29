//Chunk 1
var nodemailer = require('nodemailer');
const express = require('express')
var mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs')
const multer = require('multer')
const path = require('path')
var cors = require('cors');
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000;

// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
// 	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
// 	res.header('Allow', 'GET, POST, OPTIONS, PUyT, DELETE');
// 	next();
// });

var dt = new Date();

var to = 'mariano.garcia@riomarket.com';
var demail;
var firstname;
var lastname;
var fname;
var lname;
var email;
var cemail;
var tlf;
var ctlf;
var civ;
var cargo;
var sucursal;
var subject;

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./files");
    },
    fileFilter : function(res, req, file, callback) {
      if (["doc","pdf"].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
          return res.redirect('http://172.50.3.35/rio-design/views/error.php');
      }
      callback(null, true);
    },
    filename: function(req, file, callback) {
        callback(null, `${req.body.firstname}${req.body.lastname}${req.body.civ}` + dt.getDate().toString().padStart(2, '0')+ (dt.getMonth()+1).toString().padStart(2, '0')  +  dt.getFullYear().toString().padStart(4, '0')   + dt.getHours().toString().padStart(2, '0')  + dt.getMinutes().toString().padStart(2, '0')  + dt.getSeconds().toString().padStart(2, '0') + "." + file.originalname.split('.').pop());
    }
});

var upload = multer({
    storage: Storage
}); //Field name and max count

app.get('/',(req,res) => {
    res.sendFile(__dirname + '/form-vacant.js')
    res.end()
})

app.post('/sendemailfile',(req,res) => {
    upload.array('fileEmp', 2)(req,res,function(err){
        if(err){
            console.log(err)
            return res.redirect('http://172.50.3.35/rio-design/views/error.php');
        }else{
          const connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "stock jobs"
          });
          // insert statement
          let insert = "INSERT INTO data_candidates(first_name, last_name, mail, phone_number, ci, date_birth, address, position, branch) VALUES ('" + req.body.firstname + "', '"+ req.body.lastname + "', '" + req.body.email + "', '" + req.body.tlf + "', '"+ req.body.civ + "', '"+ req.body.dateofbirth + "', '"+ req.body.address + "', '"+ req.body.cargo + "', '"+ req.body.sucursal + "')";

          // execute the insert statement
          connection.query(insert);

          // disconnect from database
          connection.end();

          firstname = req.body.firstname
          lastname = req.body.lastname
          email = req.body.email
          from = `${firstname} ${lastname} <${cemail}>`
          tlf = req.body.tlf
          civ = req.body.civ
          cargo = req.body.cargo
          sucursal = req.body.sucursal
          subject = `Mensaje enviado de ${firstname} ${lastname} <${email}> sobre vacante ${cargo} en ${sucursal}`
          const output = `<p>Hola, Talento Humano de Rio, <br><br>Recibiste un mensaje de <strong>${firstname} ${lastname}:</strong> <br><br>${req.body.body}<br><br>Nro. de C.I.V: ${civ} <br>Nro. de Tlf: (+58) ${tlf} <br>Correo Electronico: ${email}</p>`
          const path1 = req.files[0].path
          const path2 = req.files[1].path
          console.log(to)
          console.log(subject)
          console.log(output)
          console.log(req.file)
          console.log(req.files)
          
          var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'info.back@riomarket.com',
                pass: 'Infoback2021**'
              }
            });
              
          var mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: output,
            attachments: [
              {
                path: path1
              },
              {
                path: path2
              }
            ]
          };
              
          try{ transporter.sendMail(mailOptions, (error, info) =>{
            if (error) {
              console.log(error);
              return res.redirect('http://172.50.3.35/rio-design/views/error.php')
            } else {
              console.log('Email enviado: ' + info.response);
              return res.redirect('http://172.50.3.35/rio-design/views/success.php')
              // fs.unlink(pathFile,function(err){
              //   if(err){
              //       return res.redirect('http://127.0.0.1/rio-design/views/error.php')
              //   }else{
              //       console.log("Eliminado")
              //       return res.redirect('http://127.0.0.1/rio-design/views/success.php')
              //   }
              // })
              
            }
          });
        } catch (error) {
            console.log('error =' + error);
        }/*                 
        } else { */
        }
    })
})

var uploadFile = multer({
  storage: Storage
}).single('files');

app.get('/',(req,res) => {
  res.sendFile(__dirname + '/contact_us.php')
  res.end()
})

app.post('/sendemail',(req,res) => {
  uploadFile(req,res,function(err){
      if(err){
          console.log(err)
          return res.redirect('http://172.50.3.35/rio-design/views/error.php');
      }else{

        tname = req.body.to_name
        fname = req.body.from_name
        lname = req.body.last_name
        cemail = req.body.user_email
        from = `${fname} ${lname} <${cemail}>`
        ctlf = req.body.number_phone
        demail = req.body.department_email
        message = req.body.message
        subject = `Mensaje enviado de ${fname} ${lname} <${cemail}>`
        const output = `<p>Hola, ${tname}, <br><br>Recibiste un mensaje de <strong>${fname} ${lname}:</strong> <br><br>${message}<br><br>Nro. de Tlf: (+58) ${ctlf} <br>Correo Electronico: ${cemail}</p>`
        console.log(to)
        console.log(subject)
        console.log(output)
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'info.back@riomarket.com',
              pass: 'Infoback2021**'
            }
          });
            
        var mailOptions = {
          from: from,
          to: demail,
          subject: subject,
          html: output
        };
            
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            return res.redirect('http://172.50.3.35/rio-design/views/error.php')
          } else {
            console.log('Email enviado: ' + info.response);
            return res.redirect('http://172.50.3.35/rio-design/views/success.php')
          }
        });/*                 
      } else { */
      }
  })
})

app.listen(PORT,() => {
    console.log(`Api iniciada en el puerto: ${PORT}`)
})