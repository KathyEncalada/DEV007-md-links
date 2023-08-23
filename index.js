const {resolveDirectory, readRecords, validateTrue} = require('./utils')

function mdLinks (path, options = {}) {
  return new Promise((resolve, reject) => {
    resolveDirectory(path) 
    .then((data) => readRecords(data))  //si resuelve pasa los datos a la fn readRecords
    .then((result) => {  //cuando resuelve pasa el result
      if (options.validate === true) {  
        validateTrue(result).then((object) => {  //valida c enlace agrega inf 
          resolve(object);
        });
      }else{
        resolve(result);  //resuelve con la lista sin validación
      }
    })
    .catch((e) => {
      reject(e); //rechaza promesa
 });
  });
};

module.exports = {mdLinks}


