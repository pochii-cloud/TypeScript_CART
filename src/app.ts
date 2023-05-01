
interface Product {
    productName:string
    productImg:string
    productDescription:string
    productPrice:string
    id:number
}

interface CartProduct {
    productName:string
    productImg:string
    productDescription:string
    productPrice:string
    id:number
    quantity:number
    productid:number
}



class SingleProduct{
    constructor(private product:Product){

    }
    render(){
        let html = `
        
        <div class="itegit m">
        <img src=${this.product.productImg} alt="${this.product.productName}" >
        <div class="product-item__content">
          <h2>${this.product.productName}</h2>
          <h3>\$ ${this.product.productPrice}</h3>
          <p>${this.product.productDescription}</p>
          <button onclick="SingleProduct.updateProduct(${this.product.id})"><ion-icon name="create-outline"></ion-icon></button>
         <button onclick="SingleProduct.deleteProduct(${this.product.id})" ><ion-icon name="trash-outline"></ion-icon></button>
         <button onclick="ShoppingCart.AddToCart(${this.product.id})" ><ion-icon name="cart-outline"></ion-icon></button>
        </div>
     </div>
        
        `

        return html
    }
    
    static async updateProduct(id:number){
        const response = await fetch(`http://localhost:3000/products/${id}`)
        const product = await response.json()
        SingleProduct.prePopulate(product)

        const btn = document.querySelector("#btn")! as HTMLButtonElement
        
        btn.addEventListener('click', ()=>{
            const updatedProduct= SingleProduct.readValues();
            if(btn.innerText==="Update Product"){
                console.log("Updating");
                SingleProduct.sendUpdate({...updatedProduct, id})
               }
           })
    }

     static async deleteProduct(id:number) {
        await fetch(`http://localhost:3000/products/${id}`, {
            method:'DELETE',
            headers:{
                "Content-Type": "application/json"
            }
        })
    }

    static async sendUpdate(product:Product){
        
        await fetch(`http://localhost:3000/products/${product.id}`, {
            method:'PUT',
            body:JSON.stringify(product),
            headers:{
                "Content-Type": "application/json"
            }
        })
    }

   static  async addProducts(){
    const newProduct= SingleProduct.readValues()
    
    await fetch(' http://localhost:3000/products', {
        method:'POST',
        body:JSON.stringify(newProduct),
        headers:{
            "Content-Type":"application/json"
        }
    })

    }

   


    static prePopulate(product:Product){
        (document.querySelector("#p_name")! as HTMLInputElement).value=product.productName;
        (document.querySelector("#p_image")! as HTMLInputElement).value = product.productImg;
        (document.querySelector("#p_price")! as HTMLInputElement).value =product.productPrice;
        (document.querySelector("#p_description")! as HTMLInputElement).value=product.productDescription;
       ( document.querySelector("#btn")! as HTMLButtonElement ).textContent= `Update Product`;
    }

    static readValues(){
        const productName= (document.querySelector("#p_name")as HTMLInputElement).value
        const productImg = (document.querySelector("#p_image") as HTMLInputElement).value
        const productPrice =(document.querySelector("#p_price") as HTMLInputElement).value
        const productDescription =(document.querySelector("#p_description") as HTMLInputElement).value
        return {productName,productImg,productDescription, productPrice};
    }



}

const btn = document.querySelector("#btn")! as HTMLButtonElement

    btn.addEventListener('click', ()=>{
        if(btn.innerText==='Add Product'){
           SingleProduct.addProducts()
        }

        console.log("Clicked");
        
    })

class ProductList   {
    
    async renderProducts(){
         let products= await this.fetchProducts()
        let html=''
        for(let product of products){
            const productHTML = new SingleProduct(product).render()
            html +=productHTML
        }
        
        return html
    }

    async fetchProducts(){
        const response = await fetch('http://localhost:3000/products')
        const products = await response.json() as Product[]
        return products
    }

}


class ShoppingCart {
    static async AddToCart (productid:number){
        const response = await fetch(`http://localhost:3000/products/${productid}`)
        const product = await response.json()
         let {id ,... productdetails} =product
         let newProduct={...productdetails, productid, quantity:1}
        
         let res = await fetch(`http://localhost:3000/cart`)
         let productinCart=await res.json() as CartProduct[]
         let findproduct= productinCart.find(product=>{
            return product.productid ===productid
         })

         if(findproduct){
           this.updateProduct(findproduct.id, findproduct.quantity)
            
         }else{
            this.addProductToCart(newProduct)
         }
        
    }

    static async addProductToCart(newProduct:CartProduct){
        await fetch('http://localhost:3000/cart', {
            method:'POST',
            body:JSON.stringify(newProduct),
            headers:{
                "Content-Type":"application/json"
            }
            })
    }


    static async updateProduct(id:number, quantity:number){
        await fetch(`http://localhost:3000/cart/${id}`, {
            method:'PATCH',
            body:JSON.stringify({quantity:quantity+1}),
            headers:{
                "Content-Type": "application/json"
            }
        })
    }

    static async reduceQuantity(id:number, quantity:number){
        if(quantity==1){
            ShoppingCart.deleteFromCart(id)
        }
        await fetch(`http://localhost:3000/cart/${id}`, {
            method:'PATCH',
            body:JSON.stringify({quantity:quantity-1}),
            headers:{
                "Content-Type": "application/json"
            }
        })
        
    }
   static async deleteFromCart(id:number){
        await fetch(`http://localhost:3000/cart/${id}`, {
            method:'DELETE',
            headers:{
                "Content-Type": "application/json"
            }
        })
    }
    async render(){
        const cart = document.querySelector("#cart")! as HTMLDivElement
        const response = await fetch(`http://localhost:3000/cart`)
        const cartproducts = await response.json() as CartProduct[]   
        let html:string='';
        for(let product of cartproducts){   
           html += `
            <div class="cartcontent">
            <p>${product.productName}</p>
            <div class="icons">
              <a onclick="ShoppingCart.reduceQuantity(${product.id},${product.quantity})" ><ion-icon name="remove-outline"></ion-icon></a>
                <p>${product.quantity}</p>
              <a onclick="ShoppingCart.updateProduct(${product.id},${product.quantity})"><ion-icon name="add-outline"></ion-icon></a>  
            </div>
    
            <p>${product.productPrice}</p>
           </div>
            
            `
        }
        cart.innerHTML= html
        
        const price = document.querySelector("#carttotal") as HTMLParagraphElement
            
        let sum = 0;

        for (let product of cartproducts){
            sum+= product.quantity * +product.productPrice
        }
        price.textContent= '$ ' + sum.toString()
    }
}

new ShoppingCart().render()

class App{
    static async Init(){
        let productList=new ProductList()
        let htmlProducts = await productList.renderProducts()
        let app= document.querySelector('#app') as HTMLDivElement
        app.innerHTML=htmlProducts
    }    
}


App.Init()


