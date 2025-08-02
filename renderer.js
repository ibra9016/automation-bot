const { exec } = require('child_process');
const runbot = require("./bot.js");
const runScript = require('./bot.js');

function collectFormData() {
    
  // Get form elements by their IDs
   const productUrl = document.getElementById('productUrl').value.trim();
   const shoeSize = document.getElementById('shoeSize').value;
   const firstName = document.getElementById('firstName').value.trim();
   const lastName = document.getElementById('lastName').value.trim();
   const address1 = document.getElementById('address').value.trim();
   const address2 = document.getElementById('optionalAddress').value.trim();
   const city = document.getElementById('city').value.trim();
   const email = document.getElementById('email').value.trim();
   const state = document.getElementById('state').value.trim();
   const postalCode = document.getElementById('postal').value.trim();
   const phone = document.getElementById('phoneNb').value.trim();
   const number = document.getElementById('cardNumber').value.trim();
   const expiry = document.getElementById('cardExpiry').value.trim();
   const verification_value = document.getElementById('cardCVC').value.trim();


   const formData = {
    productUrl,
    shoeSize,
    firstName,
    lastName,
    address1,
    address2,
    city,
    email,
    state,
    postalCode,
    phone,
    number,
    expiry,
    verification_value
   };

   console.log(formData)
   runScript(formData)
    .then(() => console.log('Bot finished successfully'))
    .catch(err => console.error('Bot error:', err));
}

const form = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  // Enable/disable button based on form validity
  function toggleButton() {
    submitBtn.disabled = !form.checkValidity();
  }

  // Listen for input events on the entire form
  form.addEventListener('input', toggleButton);

  // Initial check
  toggleButton();

form.addEventListener('submit',(e)=>{
    e.preventDefault();
})