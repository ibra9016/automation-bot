const { exec } = require('child_process');
const { ipcRenderer } = require('electron');
let loadmessage = document.getElementById('loadingMessage');

ipcRenderer.on('bot-message', (event, message) => {
  displayLog(message);
});

ipcRenderer.on('available-sizes', (event, sizes) => {
  const select = document.getElementById('shoeSize');
  
  sizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size.value;
    option.textContent = size.label;
    select.appendChild(option);
  });
  select.disabled = false;
  loadmessage.style.display = 'none';
});

function displayLog(message) {

  // Get the container element where you want to add the log messages
  const logContainer = document.getElementById('log-output');

  // Create a new div element
  const logEntry = document.createElement('div');
  logEntry.textContent = message;
  logEntry.className = "log-entry"; // Add a class for styling

  // Append the new div to the container
  logContainer.appendChild(logEntry);
}

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
 
   ipcRenderer.send('run-bot-script', formData);
   form.style.display = 'none';
   log.style.display = 'block';
}

  const form = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');
  const log = document.getElementById("log-output");

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

document.getElementById('productUrl').addEventListener('paste', (event) => {
  loadmessage.style.display = 'block';
  
  setTimeout(() => {
    const url = event.target.value;
    console.log("Pasted URL:", url);
    
    ipcRenderer.send('run-size-search', url);
  }, 50); // Delay to ensure the pasted value is available
});