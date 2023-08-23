#!/usr/bin/env node

const {mdLinks}  = require('./index.js');
const chalk = require('chalk'); //libreria para dar formato
const argumento1 = process.argv[3];
const argumento2 = process.argv[4];
const path2 = process.argv[2];   //ruta de arch o directorio "generalmente"

let options = {          //obj inicia en false y determina si se db realizar una validación de los enlaces o no 
    validate: false,
};

if(argumento1 === '--validate' || argumento2 === '--validate'){   
    options.validate = true;  //true, si se valida los enlaces
};

mdLinks(path2, options)   
 .then((links) => {
    if (links.length === 0) {
        console.log(chalk.bgBlack.hex("#4dcdff")('No URL found 🔍!'));
    };

    const uniqueValueCount = countUniqueUrl(links, 'href');
    if (
        argumento1 !== '--validate' &&
        argumento1 !== '--stats' &&
        argumento1 !== undefined
    ) {
        console.log(chalk.bgBlack.hex("#4dcdff")(
            `${argumento1} is not valid. Try --validate or --stats`
        ));
    } else if (
        argumento2 !== '--validate' && 
        argumento2 !== '--stats' &&
        argumento2 !== undefined
    ) {
        console.log(chalk.bgBlack.hex("#4dcdff")(
            `${argumento2} is not valid. Try --validate or --stats`
        ));
    } else if (argumento1 !== '--stats' && argumento2 == undefined) {
        links.map((object) => {  //map del array links
            console.log(
                `${object.href} ${chalk.bgBlack.hex('#4dcdff')(        //???
                    object.ok || ''
                )} ${chalk.bgBlack.hex('#4dcdff')(object.status || '')} | ${
                    object.text
                }`
            );
        });
    } else if (argumento1 == '--stats' && argumento2 == '--validate' || argumento1 == '--validate' && argumento2 == '--stats') {
        const numberCount = countNumberOcurrences(
            links.map((obj) => obj.status), 404 );   //calcula sel numero de ocurrecias del 404
        console.log(`Total: ${links.length}`);
        console.log(`Unique: ${uniqueValueCount}`);
        console.log(`Broken: ${numberCount}`);       
    } else {
        console.log(`Total: ${links.length}`);
        console.log(`Unique: ${uniqueValueCount}`);
    }
 })
 .catch((err) => {
    console.log(err);
 });


 function countUniqueUrl(array, key) {
    const uniqueUrl = new Set();   //set estructura de datos que almacena valores unicos
    array.map((obj) => uniqueUrl.add(obj[key])); //add agrega el key al Set 
    
    return uniqueUrl.size;  // devuelve el tamaño del set
 };


 function countNumberOcurrences(array, status404) {
    const numberCount = array.reduce((count, obj) => {  //reduce itra y acumula la cantidad de veces de 404
        if(obj === status404) {
            count++ ;
        }
        return count;
    }, 0); 

    return numberCount;
 };

