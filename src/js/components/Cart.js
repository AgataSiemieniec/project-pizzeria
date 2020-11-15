class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      // console.log('new Cart:', thisCart);
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
    add(menuProduct) {
      // console.log(this);
      const thisCart = this;
      
      // / generate HTML based on template /
      const generatedHTML = templates.cartProduct(menuProduct);
      
      // / create DOM using utils.createElementFromHTML /
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      
      // / add DOM to thisCart.dom.productList /
      thisCart.dom.productList.appendChild(generatedDOM);

      //console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      // console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }
    update(){
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      
      for(let product of thisCart.products){
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }
      thisCart.totalPrice =  thisCart.subtotalPrice + thisCart.deliveryFee;

      console.log('this.totalNumber',this.totalNumber);
      console.log('this.subtotalPrice',this.subtotalPrice);
      console.log('this.totalPrice',this.totalPrice);

      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }

    }
    remove(cartProduct){
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }
    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: 'test',
        totalPrice: thisCart.totalPrice,      
        totalNumber: thisCart.totalNumber,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        deliveryFee: thisCart.deliveryFee,
        phone: thisCart.phone,
        products: [],
      };

      for(let product of thisCart.products){
        product.getData();
        payload.products.push(product.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
    }
}

export default Cart;