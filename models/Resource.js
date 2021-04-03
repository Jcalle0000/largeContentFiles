const mongoose = require('mongoose');

const ResourceSchema=mongoose.Schema({
    name:{              // name of the file
        type:String,
        required:true,
    },
    category:{          // syllabus, textbook, exam?
        type:String,
        // required:true,
    },
    uploadDate:{
        type:Date,
        default:Date.now, // this is good 
    },
    uploader:{
        type:String,
        // required:true, // can get from the slackId
    },
    class:{
        type:String,
        // required:true,
    },
    department:{
        type:String,
        // required:false, // this would be good to make required
    },
    fileType:{      // this can be found after using JSON.parse
        type:String, // type will be applicationPDF, can also be images
        // required:false
    },
    // fileData:{   // this is encoded into base64 with a buffer function when uploading through the POST api/resource/new api
    //     type:Buffer,
    //     required:false // this can probably be false
    // },
    fileObject:{
        // type: mongoose.Schema.Types.ObjectId, // will reference 
        // ref:'' 
        type:String
    }

});

module.exports=mongoose.model("Resource", ResourceSchema);