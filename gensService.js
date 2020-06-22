const path = require('path');
const fs = require('fs');
const { prefix, chunkSize, gensFile, isFullPath } = require('config');
const readChunk = require('read-chunk');

const indices=[];
/// in the config file we can set the file as a relative path in case the isFullPath property is false,
/// when you set the isFullPath to true, you should provide it's full path in the gensFile property.
const filePath = isFullPath ? gensFile : path.join(__dirname, gensFile);

/// this method is inviked once the server is initiated, and it's purpose is to read the whole file by chunks,
/// and fill the indices[] with all prefixes indexes. 
async function loadFile(){  
  let prev=undefined;
  let data='';
  let chunks=0;
  let totalOffset=0;
  
  let readStream = fs.createReadStream(filePath,{ highWaterMark: chunkSize, encoding: 'utf8' });
  
  for await(chunk of readStream) {
    if(prev === undefined) {
      prev = chunk;
      chunks+=1;
    } else {
      data= prev + chunk;
      prev = chunk;
      chunks+=1;  
      let offset = 0;
      let index;
      while ((index = data.indexOf(prefix, offset)) > -1 ) {
          indices.push(index+totalOffset);
          offset = index+1;
      }
      totalOffset+=chunk.length;
    }
  }
}

/// the implementation of the find gen endpoint.
function findGen(req, res){
  let gen = req.params.gen;
  
  if (!gen.startsWith(prefix) || indices.length ===0)
    return res.sendStatus(400);

  let genLength = gen.length;
  let found = false;

  for(item=0; item < indices.length && !found; item++){
    let data = readChunk.sync(filePath, indices[item], genLength).toString();
    if(data === gen){
      found = true;
      res.sendStatus(200);  
      return;
    }
  }
  res.sendStatus(404);
}

module.exports = {
  loadFile,
  findGen,
};