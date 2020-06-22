const express = require('express');
const app = express();
const gensService = require('./gensService');
const { port } = require('config'); 

function loadServer() {
  app.get('/', (req, res) => {
    res.send('Hello World!'); 
  })
  
  app.get('/genes/find/:gen', (req, res) => {
    return gensService.findGen(req, res);
  })
  
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  })
}


(async () => {
  await gensService.loadFile()
    .then(() => {
      loadServer();
    }).catch(e => console.log(e))
  })();
