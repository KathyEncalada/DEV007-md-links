const path = require('path');
const fs = require('fs');
const https = require('https');

//función retorna promesa que resuelve o rechaza
function resolveDirectory (input) {
  return new Promise(function (resolve, reject) {

    //verifica si input es de tipo string o no
    if (typeof input !== 'string') {
      reject ('The path must be a string');
    }

    //comprueba si input es una ruta relativa y si lo es la convierte (path.resolve)
    if (!path.isAbsolute(input)) {
      input = path.resolve(input);
    }

    //verifica si la ruta existe en el sistema de archivos (fs.existsSync), si no reject
    if (!fs.existsSync(input)) {
      reject(`${input} Directory/File not found`);
    }

    //array que utiliza para almacenar rutas de arch MD
    let array = []

    //verifica si la ruta es un directorio y si lo es entra en él (statSync obtiene información sobre el archivo)
    if (fs.statSync(input).isDirectory()) {  
        const recursivity = readDirectory(input);

        //función explora contenido del directorio
        function readDirectory (directory) {

          //obtener lista de archivos (readdirSync)
          const files = fs.readdirSync(directory);
          const results = [];

          //iterar sobre c/archivo
          files.forEach((file) => {

            //crea la ruta completa al archivo (ubicación más nombre)
            const fullPath = path.join(directory, file);

            //verifica si la ruta completa es un directorio
            if (fs.statSync(fullPath).isDirectory()) {

              //explora el contenido del directorio (readDirectory, es recursiva)
              const subDirectoryFiles =  readDirectory(fullPath);

              //lo obtenido se agrega al array -- ...operador de propagación, agrega c/elem indv 
              results.push(...subDirectoryFiles);

            //verifica si file es md (extname obtiene la ext del archivo)
            } else if (path.extname(file) ===  '.md') {
              //se agrega la ruta completa
              results.push(fullPath);
           }
         });

        //no hay arch md reject
        if (results.length === 0) {
          reject('No markdown files found');
        } else {
          return results; //results array con la ruta de los archivos
        }       
      };

      resolve(recursivity);
    } else if (path.extname(input) === '.md') {
      array.push(input);
      resolve(array);
    } else {
      reject(`${input} is not a markdown`)
    }
  })
};


function readRecords(file){
    return new Promise((resolve, reject) => {
        
        //busca texto y enlaces
        const linkRegex = /\[([^\]]+)\]\(((?!#)(https[^\)]+))\)/g;

        //array donde se almacenarán los enlaces
        const links = [];
        //almacena informacion de cada coincidencia
        let match;
        file.map((element, index, longitud) => {

            //se utiliza para leer el archivo
            fs.readFile(element, (err, data) => {

                //repite para buscar todas las coincidencias de enlace mientras exec encuentre coincidencias en data
                while((match = linkRegex.exec(data)) !== null){

                    //match contienen la informacion de la coincidencia y [1 o 2] el grupo de captura
                    const linkText = match[1];
                    const linkUrl = match[2];
                    links.push({ href: linkUrl, text: linkText, file: element}); //file: element ruta del arch donde se encontro el enlace
                }if(index === longitud.length -1){ //si la longitud es la misma al ultimo valor del array se resuelve la promesa
                    resolve(links);
                }
            });
        });
    });
};


function getRequest(link) {
    return new Promise((resolve, reject) => {
        try {       //maneja excepciones que pueden o no ocurrir durante la solicitud https
            https   // modulo que hace solicitud get a url específico
              .get(link.href, (res) => {  //(res) parametro contiene respuesta http 
                const { statusCode } = res;  //extrae codigo de (res) y la almacena

                if(statusCode >= 200 && statusCode <= 399) {  //verifica que este en el rango 200 a 399 
                    link.ok ='ok';   
                }else{
                    link.ok = 'fail';
                } link.status = statusCode  //asigné código a la propiedad status
                resolve(link); //resuelve con el obj link
                res.on('end',() => {   //evento end 
                    resolve(link);                    
                });
              })
              .on('error', (err) => {   //on a evento error si encuentra algun error 
                link.ok = 'fail';   
                link.status = 'error';
                resolve(link);  //resuelve con obj link que contiene info del error
              });
        } catch (error) {  
            link.ok = 'fail';
            link.status = 'error';
            resolve(link);
        }
    });
};



function validateTrue (array_links) {  
    return new Promise((resolve, reject) => {
        const promises = array_links.map((link) => {  
            return getRequest(link);  //se llama getrequest() x cada elemento link en el array
        });
         
        Promise.all(promises) //para que todas las promesas en el array se resuelvan
        .then((results) => {
            resolve(results); 
        })
        .catch((error) => {
            reject(error);
        });
    });
};

module.exports = {resolveDirectory, readRecords, getRequest, validateTrue};

