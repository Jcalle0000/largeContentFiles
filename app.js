const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const methodOverride = require('method-override')
const bodyParser=require('body-parser')
const Grid=require('gridfs-stream')
const path = require('path');
const GridFsStorage=require('multer-gridfs-storage') // compatible with MongoDB version 2 and 3
// const path=require('path')
const multer=require('multer');
dotenv.config();
const app = express();


app.use(methodOverride('_method'))

mongoose.connect(process.env.DB_CONNECT, { // This is connected to 'secondDatabase within monggodb cloud
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const conn = mongoose.connection
  .once(
      "open", () => console.log("\n\nConnected - Large Files - 5400\n"+
        "localhost:5400/api/pdfs\n\n")
  )
  .on(
    "error", (error) => {
        console.log("Mongoose error", error);
    }
  );

// Sending data in some form of a data object
//( req.body is an object)
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //

app.set('view engine','ejs') // EJS - html with JS
app.use('/assets', express.static('assets')) // css goes here

// GridFsStream Documentation
// var conn = mongoose.createConnection(process.env.DB_CONNECT); // DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.(Use `node --trace-deprecation ...` to show where the warning was created)(node:15498) [MONGODB DRIVER] Warning: Top-level use of w, wtimeout, j, and fsync is deprecated. Use writeConcern instead.

let gfs
let GridFsBucket // 12:13 breaking

conn.once('open', ()=> { // CallBack vs Function
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads') // we specifiy the name for the collection we want to use
  // all set!
  GridFsBucket= new mongoose.mongo.GridFSBucket(conn.db,{
      bucketName:'uploads' // collection
  })

})

// End of GridFsStream Documentation

// Multer GridFS Storage Documentation
const storage = new GridFsStorage({
    url: process.env.DB_CONNECT,
    options:{useUnifiedTopology:true},
    file: (req, file) => {
      if (
          file.mimetype === 'image/jpeg'||
            file.mimetype==='img/png' ||
            file.mimetype==='image/png'
      ) {
        
        // console.log(file) // return fieldname, originalName, encooding, mimetype

       return {
           filename:file.originalname,
           bucketName:'uploads'
       }

      } else if(file.mimetype==='application/pdf'){
          return {
            filename:file.originalname,
            bucketName:'uploads' // GridFsBucket // bucket should match collection name
          };
      } 
      else {
        console.log("Not valid mime type")
        return null;
      }
    }
});

const upload_M = multer({ storage });

app.get('/index', async(req,res)=>{
    try{
        // res.send("hello")
        // res.render("index.ejs")

        gfs.files.find().toArray((err,files)=>{
            if(!files || files.length===0){
                return res.send("No Files Exists")
            }
            else {
                // res.json(files)
                res.render( "index.ejs" , {
                    mfiles:files
                })
            }
        })

    }catch(err){
        res.send("Could not load files")
    }
} )
// GridFs Stream Documentation
// incoporates gfs from outside
app.get('/index/:filename', async(req,res)=>{
    try{
        // res.send("hello")
        // res.render("index.ejs")

        gfs.files.findOne({filename:req.params.filename}, // from url
            (err,file)=>{
                if(!file ||file.length===0){
                    res.send("No File Exists")
                }
                else {
                    // return res.json(file)
                    // More GridFs Stream Documentation
                    if(file.contentType==='image/png' || file.contentType==='img/png'
                        || file.contentType==='application/pdf'
                    ){
                        // const readStream=gfs.createReadStream(file.filename)
                        const readStream=GridFsBucket.openDownloadStream(file._id)
                        readStream.pipe(res)
                    }else {
                        res.json(file) // so that we can see its contents with json
                    }
                }
            }
        )

    }catch(err){
        res.send("Could not load files")
    }
} )

app.get('/fileUpload', async(req,res)=>{
    try{
        res.render("uploadPage.ejs")
    }catch(err){
        res.send("Could not render File Upload Page")
    }
})

// upoload_M is middleWare
// localhost:5400/fileUpload
app.post('/fileUpload', upload_M.single('uiFile'), (req,res)=>{
    try{

        // console.log(req.file) // multer documentation refers to uiFile
        // req.file nice attributes -> id, filename, bucketName, uploadDate

        res.redirect('/index') // since we should see this new file in the Index
    
    }catch(err){
        res.send("Error Uploading File")
    }
} )



const pdfRoute=require("./routes/pdf")
app.use('/api/pdfs', pdfRoute)

app.listen(process.env.PORT || 5400);