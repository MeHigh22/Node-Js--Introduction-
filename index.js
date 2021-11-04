const fs = require('fs');

const http = require('http');
const url = require('url');


//FILES

//Call in the module we need, the http one. 

// const textIn = fs.readFileSync('./txt/input.txt', "utf-8");

// console.log(textIn);

// const textOut = `This is what we know about the avocado : ${textIn} .\n Created on ${Date.now()}`;

// fs.writeFileSync("./txt/output.txt", textOut);

//Non-blocking, async way

//On utilisera un call-back. Souvent, le premier paramètre est une erreur.
//Lorsque la fonction va se lancer, elle va lire le fichier demandé et ne va pas bloquer l'exécution du code. NodeJS is built on the philosophy of callbacks.

//Data doit être toujours en deuxième dans le callback.
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//     if(err) return console.log("ERROR")
//     fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//         console.log(data2);
//         fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, "utf-8", err => {
//                 console.log("Your file has been written")
//             })
//         });
//     });
// });

//Le console.log va se lancer avant le readFile, pourquoi? NodeJS va faire en sorte que le fichier est lu dans le background sans empêcher le reste du code de se lancer. (Important !)
// console.log("Will read file!");

////////////////////////////////////////////////////////////////

//SERVER
//Two important variables, request and response.
//On a crée un server en utilisant createServer qu'on a pris du module http. On l'a mis dans une variable, et après on va l'écouter avec un listen, on met le port en paramètre, et après l'adresse locale, et ensuite un troisème paramètre qui s'exécuter dès qu'on rentre dans un event loop.

//ROUTING
//How to route?
//We need a big if/else statement. Si la PathName === "x" alors on aura res.end = Y.
//What is a head in HTTP? Many standard headers to inform the browser or clients about the response itself. Called Response Headers.

//Comment créer une API simple?

const replaceTemplate = (temp, product) => {
    //Si on veut remplacer plusieurs instances de variables, on va mettre le nom entre / et ajouter un g à la fin pour le rendre global.
    let output = temp.replace(/{%PRODUCTNAME%}/g , product.productName);
    output = output.replace(/{%IMAGE%}/g , product.image);
    output = output.replace(/{%PRICE%}/g , product.price);
    output = output.replace(/{%FROM%}/g , product.from);
    output = output.replace(/{%NUTRIENTS%}/g , product.nutrients);
    output = output.replace(/{%QUANTITY%}/g , product.quantity);
    output = output.replace(/{%DESCRIPTION%}/g , product.description);
    output = output.replace(/{%ID%}/g , product.id);
    
    if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    return output;
}
//Version Sync
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
//Comment faire pour remplacer les placeholders dans la template? notre dataObj contient la data parsée JSON en array. Il faut looper sur l'array et remplacer.
const dataObj = JSON.parse(data);

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8");



const server = http.createServer((req, res) => {
    
    //Si on regarde dans le parsing du url, on peut voir qu'il possède plusieurs propriétés, dans ce cas-ci, nous avons query, c'est à dire l'ID de notre produit et pathname, le lien qui mène vers ce produit(card).
    const {query, pathname} = url.parse(req.url, true);


    //WELCOME PAGE
    if (pathname === "/" || pathname === "/overview") {
        res.writeHead(200, {
            "Content-type": "text/html"
        });
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join("");
        const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
        res.end(output);

        //PRODUCT PAGE
    } else if (pathname === "/product") {
        //On va créer une variable qui va nous permettre de rentrer dans l'array de dataObj et recupérer l'élement qui est à la position query.ID
        res.writeHead(200, {
            "Content-type": "text/html"
        });
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
        

        //API

    } else if (pathname === "/api") {
        //JSON.parse va prendre les data de notre fichier et va le traduire en string.
        res.writeHead(200, {
            "Content-type": "application/json"
        });
        res.end(data);

        //NOT FOUND

    } else {
        //Header content must be put before the res.end
        res.writeHead(404, {
            "Content-type": "text/html",
            "my-own-header": "Hello-World"
        });
        res.end("<h1>Page not found</h1>");
    }
});

server.listen(8000, "127.0.0.1", () => {

    console.log("Listening to requests on port 8000");

});

