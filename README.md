### Large Content Files - Working

### Description
Use MongoDB's gridFsStorage to be able to upload large files of data.
<ol>
    <li>This includes large movie, images, pdf files</li>
    <li>Files are seperated into 2 different sections (Chunks and Attributes)</li>
    <li>Stored File Object Id into Resource Oject </li>
    - Main Feature Found In: localhost:5400/api/pdfs
</ol>


### Resources
<ol>
  <li>
        <a href="https://developer.mongodb.com/how-to/storing-large-objects-and-files/">
        Objective: Breif Description: Storing Large Objects and Files</a> 
  </li>
    <li><a href="https://www.npmjs.com/package/gridfs-stream">
            Grid Fs Stream Documentation</a> </li>
                - Connection setup <br>
                - Accessing MetaData - findOne() <br>
                - Reading Stream  <br>
                - Choosing start and end <br>
    <li><a href="https://www.npmjs.com/package/multer#readme">
    Multer</a> </li>
    -Properties:  (FieldName, orignal Name, encoding, mimetype) <br>
    - (Path, buffer) <br>
    - req.file. (filename, id, bucketName, uploadDate )
    <li><a href="https://www.npmjs.com/package/multer-gridfs-storage">
        Multer gridfs Storage Documentation</a> </li>
     <li><a href="https://mongodb.github.io/node-mongodb-native/2.2/api/GridFSBucket.html">
        GridFsBuckets</a> </li>
            - open Download Stream
</ol>

### Pros 
<ol>
    <li>Improved Querying speed</li>
    <li>Scalability</li>
</ol>

### Cons
<ol>
    <li></li>
</ol>