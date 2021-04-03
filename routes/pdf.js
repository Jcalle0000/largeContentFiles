const router=require("express").Router()
const mongoose = require("mongoose");
const Grid=require('gridfs-stream')
const GridFsStorage=require('multer-gridfs-storage') // compatible with MongoDB version 2 and 3
const multer=require('multer');
// create application/json parser
const Resource=require('../models/Resource'); // Using Events Schema

const conn = mongoose.connection
  .once(
      "open", () => {
          //console.log("Connected - Large Files - 5500")
        }
  )
  .on(
    "error", (error) => {
        console.log("Mongoose error", error);
    }
  );
let gfs
let GridFsBucket // 12:13 breaking

conn.once('open', ()=> { // CallBack vs Function
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('resources') // we specifiy the name for the collection we want to use
    // all set!
    GridFsBucket= new mongoose.mongo.GridFSBucket(conn.db,{
        bucketName:'resources' // collection
    })
})

const storage = new GridFsStorage({
    url: process.env.DB_CONNECT,
    options:{useUnifiedTopology:true},
    file: (req, file) => {
      if (
          file.mimetype === 'image/jpeg'||
            file.mimetype==='img/png' ||
            file.mimetype==='image/png'
      ) {
        return {
            filename:file.originalname,
            bucketName: 'resources' // GridFsBucket bucketName	The GridFs collection to store the file (default: fs)
        };
      } else if(file.mimetype==='application/pdf'){
          return {
              filename:file.originalname,
              bucketName:'resources' // GridFsBucket // bucket should match collection name
          };
      } 
      else {
        console.log("Not valid mime type")
        return null;
      }
    }
});

const upload_M = multer({ storage });

// localhost:5400/api/pdfs/resourcesUpload
router.get('/resourcesUpload', (req,res)=>{
    try{
        // console.log("Here")
        // console.log(req.body)
        res.render("resources/resourceUpload.ejs")
    }catch(err){
        res.send("Could not render resource Upload Page")
    }
})

// /api/pdfs
router.get('/', async(req,res)=>{
    try {
        const resources = await Resource.find();
        // res.send("All good")
        gfs.files.find().toArray((err,files)=>{

            if(!files || files.length===0){
                return res.send("No Files Exists")
            }
            else {
                // res.json(files)

                res.render( "resources/indexResources.ejs" , {
                    mfiles:files,
                    resources:resources
                })
            }
        }) // end of gfs.files
    }
    catch(err){
        res.send(err)
    }  
})

// /api/pdfs/resourcesUpload
router.post('/resourcesUpload', upload_M.single('uiFile') ,async(req,res)=>{ // , upload_M.single('uiFile') 
    try{
        // res.send( req.body )
        // console.log(req.file) // this comes from upload_M.single - Multer attributes
        res.redirect('/api/pdfs')

        const resource= new Resource({
            name:           req.body.name,
            category:       req.body.category,
            uploadDate:     req.body.uploadDate, // try to see how this can be set automatically
            uploader:       req.body.uploader, // the person who uploaded the file - can also be set automatically
            class:          req.body.class,
            department :    req.body.department,
            fileType:       req.file.mimetype,
            fileObject:     req.file.id
        })

        const savedResource= await resource.save()
    
    }catch(err){
        // res.send("Could not render File Upload Page")
        res.send(err)
    }
})

// Object Id from resources.files was saved in resource fileObject

// /api/pdfs/id
router.get('/:id',async (req,res)=>{
    try{
        // res.render("index.ejs")
        // const resourceObject = await gfs.files.findById(req.params.id)
        // if(resourceObject==null){
        //     res.send("Null")
        // }
        var readStream= gfs.createReadStream({
            _id:req.params.id
        })
        
        readStream.pipe(res)

        // gfs.files.findOne({_id:req.params.id}, // from url
        // // await gfs.files.findById({req.params.id},
        //     (err,file)=>{
        //         if(!file ||file.length===0){
        //             res.send("No File Exists")
        //         }
        //         else {
        //             // return res.json(file)
        //             // More GridFs Stream Documentation
        //             if(file.contentType==='image/png' || file.contentType==='img/png'
        //                 || file.contentType==='application/pdf'
        //             ){
        //                 // const readStream=gfs.createReadStream(file.filename)
        //                 const readStream=GridFsBucket.openDownloadStream(file._id)
        //                 readStream.pipe(res)
        //             }else {
        //                 res.json(file) // so that we can see its contents with json
        //             }
        //         }
        //     }
        // )

    }catch(err){
        // res.send("Could not load files")
        res.send(err)
    }
} )

// /api/pdfs/filename
// router.get('/:filename',(req,res)=>{
//     try{
//         // res.send("hello")
//         // res.render("index.ejs")

//         gfs.files.findOne({filename:req.params.filename}, // from url
//             (err,file)=>{
//                 if(!file ||file.length===0){
//                     res.send("No File Exists")
//                 }
//                 else {
//                     // return res.json(file)
//                     // More GridFs Stream Documentation
//                     if(file.contentType==='image/png' || file.contentType==='img/png'
//                         || file.contentType==='application/pdf'
//                     ){
//                         // const readStream=gfs.createReadStream(file.filename)
//                         const readStream=GridFsBucket.openDownloadStream(file._id)
//                         readStream.pipe(res)
//                     }else {
//                         res.json(file) // so that we can see its contents with json
//                     }
//                 }
//             }
//         )

//     }catch(err){
//         res.send("Could not load files")
//     }
// } )


module.exports=router