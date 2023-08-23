const { mdLinks } = require("./index.js");

mdLinks(process.argv[2], {validate: true}).then((r) => console.log(r));
