//Chunk 1
var nodemailer = require('nodemailer');
const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')
const multer = require('multer')
const path = require('path')
var cors = require('cors');
const app = express()
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});
const connection = require('./db/db');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000;

// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
// 	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
// 	res.header('Allow', 'GET, POST, OPTIONS, PUyT, DELETE');
// 	next();
// });

var dt = new Date();

var to = process.env.RECEIVED_MAIL;
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
let id = 0;

//Module Upload File on the server and mail

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
        callback(null, `${req.body.firstname}${req.body.lastname}${req.body.civ}` + dt.getDate().toString().padStart(2, '0')+ (dt.getMonth()+1).toString().padStart(2, '0')  +  dt.getFullYear().toString().padStart(4, '0')   + dt.getHours().toString().padStart(2, '0')  + dt.getMinutes().toString().padStart(2, '0')  + dt.getSeconds().toString().padStart(2, '0') + dt.getMilliseconds() + "." + file.originalname.split('.').pop());
    }
});

//Add files on the storage

var upload = multer({
    storage: Storage
}); //Field name and max count

//Module Employee on the website

app.get('/',(req,res) => {
    res.sendFile(__dirname + '/form-vacant.js')
    res.end()
})

//Function by send mail with attachment and data by DB

app.post('/sendemailfile', async (req,res) => {
    upload.array('fileEmp', 2)(req,res,function(err){
      try{
        if(err){
            console.log(err)
            return res.redirect('http://172.50.3.35/rio-design/views/error.php');
        }else{
          // insert statement
          let compare = `SELECT COUNT(*) FROM data_candidates WHERE (mail = '${req.body.email}' OR ci = ${req.body.civ}) AND id_job_dc = ${req.body.id_cargo}`
          let insert = `CALL sp_AddCandidates("${req.body.firstname}", "${req.body.lastname}", "${req.body.email}", "${req.body.tlf}", "${req.body.civ}", "${req.body.dateofbirth}", "${req.body.address}", "${req.body.id_cargo}", "${req.body.id_sucursal}")`;

        //   connection.query(compare, (error, result) => {
        //     if(result.length==0){
        //       console.log(result);
            connection.query(insert,function(error, results){
            try{
                if(error){
                    throw error;
                }else{
                    console.log(results);
                } 
            } catch (error) {
                console.log('error =' + error);
            } 
            });
        //     }else{
        //       return res.redirect('http://172.50.3.35/rio-design/views/success.php')
        //     }
        //   });
          
          // execute the insert statement
          
          //var local by the components for send mail
          
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
          
          //function transporter of nodemailer with the services and data accout that sender

          var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.USER_MAIL,
                pass: process.env.USER_PASSWORD
              }
            });
              
          //function constructor on the body message email
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
        
          //Send mail with comprobations

          try{ 
            transporter.sendMail(mailOptions, (error, info) =>{
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
            return res.redirect('http://172.50.3.35/rio-design/views/error.php')
        }/*                 
        } else { */
        }
      } catch (error) {
        console.log('error =' + error);
        return res.redirect('http://172.50.3.35/rio-design/views/error.php')
    }
  })
    
})

var uploadFile = multer({
  storage: Storage
}).single('files');

//Module Contact Us Website

app.get('/',(req,res) => {
  res.sendFile(__dirname + '/contact_us.php')
  res.end()
})

//Function by send mail

app.post('/sendemail',(req,res) => {
  uploadFile(req,res,function(err){
    try{
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
              user: process.env.USER_MAIL,
              pass: process.env.USER_PASSWORD
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
    } catch (error) {
      console.log('error =' + error);
      return res.redirect('http://172.50.3.35/rio-design/views/error.php')
  }
  })
})

app.get('/',function(req,res){
  res.send("Ruta inicial");
});

//Mostrar todos los candidatos//
app.get('/api/vacants', (req,res)=>{
  connection.query('SELECT d.id, d.first_name, d.last_name, d.mail, d.phone_number, d.ci, d.date_birth, d.address, b.branch AS branch, id_branch_dc, v.name AS position, id_job_dc, DATE_FORMAT((d.date), "%d/%m/%Y %H:%i:%S") AS date FROM data_candidates AS d LEFT JOIN branch_offices AS b ON d.id_branch_dc=b.id LEFT JOIN vacant_jobs AS v ON d.id_job_dc=v.id', (error,filas)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(filas);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
});

//Mostrar las candidatos por id//
app.get('/api/vacants/:id', (req,res)=>{
  connection.query('SELECT id, first_name, last_name, mail, phone_number, ci, date_birth, address, id_branch_dc, id_job_dc, DATE_FORMAT((date), "%d/%m/%Y %H:%i:%S") AS date FROM data_candidates WHERE id = ?', [req.params.id], (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
});

//Mostrar todos los estados//
app.get('/api/states', (req,res)=>{
  connection.query('SELECT * FROM states', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})

//Mostrar todos los estados donde hay vacantes disponibles
app.get('/api/states/:avaibility', (req,res)=>{
  connection.query('SELECT state FROM states WHERE id IN (SELECT DISTINCT id_state FROM avaibility_jobs WHERE avaibility > 0)', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})

//Mostrar todos las ciudades //
app.get('/api/cities', (req,res)=>{
  connection.query('SELECT * FROM cities', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})

//Mostrar todos las ciudades donde hay vacantes disponibles//
app.get('/api/cities/:avaibility', (req,res)=>{
  connection.query('SELECT city FROM cities WHERE id IN (SELECT DISTINCT id_city FROM avaibility_jobs WHERE avaibility > 0)', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})

//Mostrar todas las sucursales//
app.get('/api/branchs', (req,res)=>{
  connection.query('SELECT * FROM branch_offices', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})

//Mostrar todas las sucursales donde hay vacantes disponibles//
app.get('/api/branchs/:avaibility', (req,res)=>{
  connection.query('SELECT branch FROM branch_offices WHERE id IN (SELECT DISTINCT id_branch FROM avaibility_jobs WHERE avaibility > 0)', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})

//Mostrar todas las sucursales donde hay vacantes en espera
app.get('/api/branchs_office/:post', (req,res)=>{
  connection.query('SELECT branch FROM branch_offices WHERE branch IN (SELECT DISTINCT branch FROM data_candidates)', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      }
  })
})


//Mostrar todos los cargos//
app.get('/api/positions', (req,res)=>{
  connection.query('SELECT * FROM vacant_jobs', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
})

//Mostrar el nombre de las vacantes disponibles//
app.get('/api/positions/:avaibility', (req,res)=>{
  connection.query('SELECT name FROM vacant_jobs WHERE id IN (SELECT DISTINCT id_jobs FROM avaibility_jobs WHERE avaibility > 0)', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
})

//Mostrar todas las vacantes requeridas//
app.get('/api/jobs/:post', (req,res)=>{
  connection.query('SELECT name FROM vacant_jobs WHERE name IN (SELECT DISTINCT v.name FROM data_candidates AS d LEFT JOIN vacant_jobs AS v ON d.id_job_dc=v.id)', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
})


//Mostrar todas las vacantes disponibles//
app.get('/api/info_vacants/', (req,res)=>{
  connection.query('SELECT a.id, s.state, c.city, b.branch, b.id AS id_branch, v.name, v.id AS id_job, a.avaibility,  DATE_FORMAT((a.date), "%d/%m/%Y") AS date, a.post AS post FROM avaibility_jobs AS a LEFT JOIN states AS s ON a.id_state=s.id LEFT JOIN cities AS c ON a.id_city=c.id LEFT JOIN branch_offices AS b ON a.id_branch=b.id LEFT JOIN vacant_jobs AS v ON a.id_jobs=v.id WHERE a.avaibility > 0 ORDER BY a.id DESC', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
})

//Mostrar todas las vacantes//
app.get('/api/jobs', (req,res)=>{
  connection.query('SELECT a.id, s.state, c.city, b.branch, v.name, a.avaibility, DATE_FORMAT((a.date), "%d/%m/%Y") AS date, a.post AS post FROM avaibility_jobs AS a LEFT JOIN states AS s ON a.id_state=s.id LEFT JOIN cities AS c ON a.id_city=c.id LEFT JOIN branch_offices AS b ON a.id_branch=b.id LEFT JOIN vacant_jobs AS v ON a.id_jobs=v.id', (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
})

//Mostrar la vacante por identificador//
app.get('/api/jobs/:id', (req,res)=>{
  connection.query('SELECT a.id, s.state, c.city, b.name, v.name, a.avaibility,  DATE_FORMAT((a.date), "%d/%m/%Y") AS date FROM avaibility_jobs AS a LEFT JOIN states AS s ON a.id_state=s.id LEFT JOIN cities AS c ON a.id_city=c.id LEFT JOIN branch_offices AS b ON a.id_branch=b.id LEFT JOIN vacant_jobs AS v ON a.id_jobs=v.id WHERE a.id = ?', [req.params.id] , (error,fila)=>{
      try{
          if(error){
              throw error;
          }else{
              res.send(fila);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
})

//crear //

app.post('/api/vacants', (req,res)=>{
  let dt = new Date();
  let publish = "" + dt.getDate().toString().padStart(2, '0') + "/" +(dt.getMonth()+1).toString().padStart(2, '0') + "/" +  dt.getFullYear().toString().padStart(4, '0') + "";
  console.log(publish)
  let data = {full_name:req.body.full_name, phone_number:req.body.phone_number, mail:req.body.mail,  ci:req.body.ci, position:req.body.position, branch:req.body.branch, post: publish};
  console.log(data)
  let sql = "INSERT INTO data_candidates SET ?";
  connection.query(sql,data, function(error, results){
      try{
          if(error){
              throw error;
          }else{
              res.send(results);
          } 
      } catch (error) {
          console.log('error =' + error);
      } 
  });
});

//crear vacante//
app.post('/api/jobs', (req,res)=>{
  let sql = `CALL Add_Vacant("${req.body.id_state}", "${req.body.id_city}", "${req.body.id_branch}", "${req.body.id_jobs}", "${req.body.avaibility}")`;
  connection.query(sql, function(error, results){
      try{
          if(error){
              throw error;
          }else{
              res.send(results);
          }  
      } catch (error) {
          console.log('error =' + error);
      } 
  });
});

//editar//

app.put('/api/vacants/:id', (req,res)=>{
  let id = req.params.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let phone_number = req.body.phone_number;
  let mail = req.body.mail;
  let ci = req.body.ci;
  let date_birth = req.body.date_birth;
  let address = req.body.address;
  let sql = "UPDATE data_candidates SET first_name = ?, last_name = ?, phone_number = ?, mail = ?, ci = ?, date_birth = ?, address = ? WHERE id = ?";
  connection.query(sql, [first_name, last_name, phone_number, mail, ci, date_birth, address, id], function(error, results){
      try{
          if(error){
              throw error;
          }else{
              res.send(results);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  });
});

//editar vacante//
app.put('/api/jobs/:id', (req,res)=>{
  let id = req.params.id;
  let avaibility = req.body.avaibility;
  let sql = "UPDATE avaibility_jobs SET avaibility = ? WHERE id = ?";
  connection.query(sql, [avaibility, id], function(error, results){
      try{
          if(error){
              throw error;
          }else{
              res.send(results);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  });
});
//eliminar candidato //

app.delete('/api/vacants/:id', (req, res) => {
  connection.query('DELETE FROM data_candidates WHERE id = ?', [req.params.id], function (error, filas){
      try{
          if(error){
              throw error;
          }else{
              res.send(filas);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
});

//eliminar vacante //

app.delete('/api/jobs/:id', (req, res) => {
  connection.query('DELETE FROM avaibility_jobs WHERE id = ?', [req.params.id], function (error, filas){
      try{
          if(error){
              throw error;
          }else{
              res.send(filas);
          }
      } catch (error) {
          console.log('error =' + error);
      } 
  })
});

app.listen(PORT,() => {
    console.log(`Api iniciada en el puerto: ${PORT}`)
})