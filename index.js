const puppeteer = require('puppeteer');
require('dotenv').config();

const env = process.env
let pathExcel
pathSelnet = "";

let productosAMostar = []
const tbody = document.querySelector('.tbody')

const codigo = document.querySelector('#codigo')
codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        buscarSolution(codigo.value)
        buscarSegurity(codigo.value)
        buscarFiesa(codigo.value)
        selnet(codigo.value)
    }
})
const spinnerSolution = document.querySelector('.spinnerSolution')
const buscarSolution = async (texto)=>{
    tbody.innerHTML = "";
    spinnerSolution.classList.remove('none')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto("https://www.solutionbox.com.ar/login");
        await page.type('#formulario-login #username',env.USUARIOSOLUTION)
        await page.type('#formulario-login #password',env.CONTRASENASOLUTION);
    
        await page.click("#formulario-login button")
    } catch (error) {
        spinnerSolution.classList.add('none')
        alert("Hubo un error con la pagina de Solution Box")

    }

    try {
        await page.waitForSelector("#content")
        await page.waitFor(2000)
        await page.click(".container-nav button")
    
        await page.type('#busqueda_autocomplete',texto)
        await page.keyboard.press('Enter')
    } catch (err) {
        spinnerSolution.classList.add('none')
        alert("Hubo un error con la pagina de Solution Box")
    }

    try {
        await page.waitForSelector("#li-product")
        await page.waitFor(2000)
    } catch (error) {
        alert("No Existe ese producto en Solution")
    }

    const productos = await page.evaluate(()=>{
        const productos = document.querySelectorAll('#li-product')
        const products = []

        for(let producto of productos){
            const product = {}
            const name = producto.children[3].children[0].children[0].innerHTML;
            let price = (producto.children[4].children[1].innerHTML === "Sin stock") ? producto.children[4].children[1].innerHTML : producto.children[4].children[0].innerText;
            price = (price !== "Sin stock") ? price.split('\n') : price;
            const iva = (price !== "Sin stock") ? price[1].split('S')[1] : "0";
            price = (price !== "Sin stock") ? parseFloat(price[0].split('S')[1]) : price;
            const stock = price !== "Sin stock" ? producto.children[5].children[0].innerHTML : price
            product.name = name;
            product.price = price;
            product.iva = parseFloat(iva);
            product.stock = stock;
            product.empresa = "Solution Box";
            products.push(product);

        }
        return products
    })
    productos.forEach(producto=>producto._id = texto)
    productos.forEach(producto =>{
        const precioFinalSolution = (producto.price === "Sin stock") ? producto.price : "u$s" + ((parseFloat(producto.price) + parseFloat( producto.iva)).toFixed(2))
        tbody.innerHTML += `
        <tr>
            <td>${producto._id}</td>
            <td>${producto.name}</td>
            <td> ${precioFinalSolution}</td>
            <td>${producto.stock}</td>
            <td>${producto.empresa}</td>
            <td><button>Agregar</button></td>
        </tr>
        `
    })
    await browser.close()
    spinnerSolution.classList.add('none')

};
const tbodySegurity = document.querySelector('.tbodySegurity')
const spinnerSegurity = document.querySelector('.spinnerSegurity')
const buscarSegurity = async (texto)=>{
    tbodySegurity.innerHTML=""
    spinnerSegurity.classList.remove('none')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto("http://w1.securityone.com.ar/");
        await page.type('#form-login #usuario',env.USUARIOSECURITY)
        await page.type('#form-login #contra',env.CONTRASENASECURITY);
        await page.click("#submit-login")


        await page.waitForSelector("#bt-shopping-cart")
        await page.type('#words-search',texto)
        await page.keyboard.press('Enter')
    } catch (error) {
        console.log(error);
    }

    try {
        await page.waitForSelector(".product-catalog-line")
    } catch (error) {
        alert("No se encontro productos en Security")
    }

    const products = await page.evaluate(()=>{
        let products = document.querySelectorAll('.product-catalog-line');
        console.log(products);
        const productosARetornar = []
        products.forEach(producto=>{
            let productName = producto.children[1].children[0].children[0].innerHTML
            let productPrice = producto.children[3].children[0].innerHTML;
            let sinStock = producto.children[1].children[0].children[2]? producto.children[1].children[0].children[2].innerHTML : (producto.children[1].children[0].children[1].innerHTML)
            sinStock =( sinStock === "Stock Disponible: 0" )? "Sin stock" : sinStock
            const retorarProducto = {
                name: productName,
                priceSegurity:productPrice,
                stock: sinStock,
                empresa: "Security One"
            }
            productosARetornar.push(retorarProducto)
        })
        return productosARetornar
    })
    products.forEach(producto=>{
        producto._id = texto
        tbodySegurity.innerHTML += `
        <tr>
            <td>${producto._id}</td>
            <td>${producto.name}</td>
            <td>${producto.priceSegurity}</td>
            <td>${producto.stock}</td>
            <td>${producto.empresa}</td>
            <td><button>Agregar</button></td>
        </tr>
        `
    })
    spinnerSegurity.classList.add('none')
}

const tbodyFiesa = document.querySelector('.tbodyFiesa');
const spinnerFiesa = document.querySelector('.spinnerFiesa')
const buscarFiesa = async (texto)=>{
    tbodyFiesa.innerHTML="";
    spinnerFiesa.classList.remove('none')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    try {
        await page.goto("https://www.fiesa.com.ar/LOGIN/Login/GlobalBluePoint-ERP.aspx")
        await page.type('#usuario',env.USUARIOFIESA)
        await page.type('#clave',env.CONTRASENAFIESA)
        await page.keyboard.press('Enter')
        await page.waitForSelector('.alert')
        await page.type('#tags',texto)
        await page.keyboard.press('Enter')
    } catch (error) {
        alert("No se pudo conectar en Fiesa")
    }

    try {
        await page.waitForSelector('.col-md-prod')
    } catch (error) {
        alert("No existe el producto en FIESA")
    }
    const products = await page.evaluate((texto)=>{
        const listaProducts = document.querySelectorAll('.col-md-prod .product')
        let productos = []
        listaProducts.forEach(product =>{
            const nombre = product.children[2].children[1].innerHTML
            const price = product.children[5].innerText.replace().trim()
            let stock = product.children[5].children[0].src.split("stockCaja",2)[1].split('.')[0]
            if(stock === "1"){
                stock = "Sin Stock";
            }else if (stock === "2") {
                stock = "Stock Bajo";
            }else if(stock === "3"){
                stock = "Stock Medio"
            }else if(stock === "4"){
                stock = "Stock Alto"
            }
          const producto = {
              nombre: nombre,
              price: price,
              stock: stock,
              _id:texto,
              empresa: "Fiesa"
          }  
          productos.push(producto);
        })

        return productos;
    },texto)

    products.forEach(product =>{
        tbodyFiesa.innerHTML += `
        <tr>
        <td>${product._id}</td>
        <td>${product.nombre}</td>
        <td>${product.price}</td>
        <td>${product.stock}</td>
        <td>${product.empresa}</td>
        <td><button>Agregar</button></td>
    </tr>
        `
    })
    spinnerFiesa.classList.add('none')
}

const file = document.querySelector('#file');
file.addEventListener('change',e=>{
    pathExcel = e.target.files[0].path;
})

document.addEventListener('click',e=>{
    if(e.path[0].innerHTML === "Agregar" || e.path[0].innerHTML === "Borrar"){
        const trSeleccionado = e.path[2];
        trSeleccionado.children[5].children[0].innerHTML === "Borrar"
        
        if (trSeleccionado.children[5].children[0].innerHTML === "Borrar") {
            trSeleccionado.classList.remove('guardado')
            trSeleccionado.classList.contains('guardado') ? trSeleccionado.children[5].children[0].innerHTML = "Borrar" : trSeleccionado.children[5].children[0].innerHTML = "Agregar"
            const Aborrar = productosAMostar.find(producto => producto.NOMBRE === trSeleccionado.children[1].innerHTML);
            const index = productosAMostar.indexOf(Aborrar);
            if (index > -1) {
                productosAMostar.splice(index,1);
            }
        }else{
            trSeleccionado.classList.add('guardado')
            trSeleccionado.classList.contains('guardado') ? trSeleccionado.children[5].children[0].innerHTML = "Borrar" : trSeleccionado.children[5].children[0].innerHTML = "Agregar"
            const productoGuardar = {
                CODIGO: trSeleccionado.children[0].innerHTML,
                NOMBRE: trSeleccionado.children[1].innerHTML,
                PRECIO: trSeleccionado.children[2].innerHTML,
                STOCK: trSeleccionado.children[3].innerHTML,
                EMPRESA: trSeleccionado.children[4].innerHTML
            }
    
            productosAMostar.push(productoGuardar)
        }
    }

})


const guardar = document.querySelector('.guardar');
guardar.addEventListener('click',async e=>{
    const fs = require('fs');
    const XLSX = require("xlsx");   
    if (fs.existsSync(`${pathExcel}`)) {
        let worksheets = {}
        const workbook = XLSX.readFile(pathExcel)
        for(const sheetName of workbook.SheetNames){
            worksheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }
        const Hoja1 = Object.keys(worksheets)[0];
        productosAMostar.forEach(product =>{
            worksheets[Hoja1].push(product);
        })
        XLSX.utils.sheet_add_json(workbook.Sheets[Hoja1],worksheets[Hoja1]);
        console.log(workbook)
        XLSX.writeFile(workbook,pathExcel)
    }
    
})

const selnet = (texto)=>{
    const tbodySelnet = document.querySelector('.tbodySelnet')
    const spinnerSelnet = document.querySelector('.spinnerSelnet')
    tbodySelnet.innerHTML=""
    spinnerSelnet.classList.remove('none')
    const XLSX = require('xlsx');
    let worksheets = {};
    if (!pathSelnet) {
        alert("No se cargo el excel de Selnet")
    }else{ 
    const workbook = XLSX.readFile(pathSelnet)
    for(const sheetName of workbook.SheetNames){
        worksheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
    let products = []
    for(const hojaExcel in worksheets){
        for(const datos of worksheets[hojaExcel]){
            products.push(datos)
        }

    }
    const productos = products.filter(product => {
        if (product.__EMPTY_1 !== undefined) {
            return (product.__EMPTY_1).includes(texto)
        }
    })

    productos.forEach(producto=>{
        const name = producto["                                   "];
        const price = producto.__EMPTY_3;
        const stock = producto.__EMPTY_5;
        const _id = producto.__EMPTY_1;

        tbodySelnet.innerHTML += 
        `
        <tr>
            <td>${_id}</td>
            <td>${name.slice(0,15)}</td>
            <td>u$s ${price}</td>
            <td>${stock}</td>
            <td>${"Selnet"}</td>
            <td><button>Agregar</button></td>
         </tr>
        `
    })
    }
    spinnerSelnet.classList.add('none')
}


const archivoSelnet = document.querySelector('#archivoSelnet');
archivoSelnet.addEventListener('change',e=>{
    pathSelnet = e.target.files[0].path
})

//ds-2ce10df0t-f
//ds-7204hghi-f1
//CABLE PATHC BNC-M A BNC-M CAB-BNC-MM