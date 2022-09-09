if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      const submitButton = this.querySelector('[type="submit"]');
      if (submitButton.classList.contains('loading')) return; 

      this.handleErrorMessage();
      this.cartNotification.setActiveElement(document.activeElement);

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.body = JSON.stringify({
        ...JSON.parse(serializeForm(this.form)),
        sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }

          // Render mini cart
          /*this.cartNotification.renderContents(response);*/

          // send trigger to Local storage and redirect to register page
          let autocompleteCartDiscount = document.querySelectorAll('.product[data-autocomplete-cart-discount]')[0].getAttribute('data-autocomplete-cart-discount');
          let redirectFinalAddress = document.querySelectorAll('.product[data-redirect-final-address]')[0].getAttribute('data-redirect-final-address');
          var finalLocation = '/'
          if (typeof autocompleteCartDiscount == 'string' && autocompleteCartDiscount != false && autocompleteCartDiscount != 'false') {
            // localStorage.setItem('RegisteredForCheckout', JSON.stringify("true"));
            finalLocation ='https://gradprep.com/discount/'+autocompleteCartDiscount+'?redirect=/'+redirectFinalAddress;
          } else {
            finalLocation = '/'+redirectFinalAddress;
          }
          location.href=finalLocation;
          
          // disble the product form button after adding to cart
          let formButtons = document.querySelectorAll('.product-form__submit');
          formButtons.forEach(function(element) {
            element.classList.add("disabled");
            element.setAttribute("disabled", "disabled");
            element.querySelector('span').innerHTML = 'Product already selected';
          })
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}
