const puppeteer = require('puppeteer');
const { finished } = require('responselike');
let taskSpeed;
let start;
let winRef;

exports.setWindow = (win) => {
  winRef = win;
};

exports.getAvailableSizes = async (productUrl)=> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(productUrl);
  await page.waitForSelector('label.SizeSwatch');

  const sizes = await page.$$eval('label.SizeSwatch', labels =>
  labels
    .filter(label => !label.classList.contains('gb-change-color'))
    .map(label => ({
      label: label.textContent.trim(),
      value: label.getAttribute('for')
    }))
);

  // Send to renderer via IPC
  if (winRef) {
    winRef.webContents.send('available-sizes', sizes);
  }

  await browser.close();
}

function logWithTimestamp(message) {
  if (!winRef) {
    return;}; // no window to send to yet
  const timestamp = new Date().toLocaleTimeString();
  const fullMessage = `${timestamp}: ${message}`;

  winRef.webContents.send('bot-message', fullMessage);
};



exports.runScript = async(formData)=>{
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  logWithTimestamp("Adding item to cart....");

  await page.goto(formData.productUrl);

   start = performance.now();
   
  await page.waitForSelector('label[for="'+formData.shoeSize+'"]');

// Click the element
    await page.click('label[for="'+formData.shoeSize+'"]');

    await page.click(".ProductForm__AddToCart");

    logWithTimestamp("Going to checkout page...");

    await page.waitForSelector('[name="checkout"]');

    //await page.click('[name="checkout"]');

    await Promise.all([
   page.waitForNavigation({ waitUntil: 'load' }),
    page.click('[name="checkout"]'),
  ]);
  logWithTimestamp("submitting address...");
  for (let key in formData) {
      if(key === 'productUrl' || key === 'shoeSize') continue;

      if(key === 'state'){
        await page.waitForSelector('[name="zone"]')
        await page.select('[name="zone"]', formData[key]);
        continue;
      }
      if(key === 'number' ){
        logWithTimestamp("Filling out card details...");
        const cardNumberFrameHandle = await page.waitForSelector('iframe.card-fields-iframe[title="Field container for: Card number"]');
        const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
        await cardNumberFrame.waitForSelector('input')
        await cardNumberFrame.type('input',formData[key]);
        continue;
      }
      if(key === 'verification_value' ){
        const cardNumberFrameHandle = await page.waitForSelector('iframe.card-fields-iframe[title="Field container for: Security code"]');
        const cardNumberFrame = await cardNumberFrameHandle.contentFrame();

        // Wait for the input with id or name "expiry"
              const verificationInput = await cardNumberFrame.waitForSelector('input#verification_value, input[name="verification_value"]', { visible: true });    
              
              await verificationInput.focus();

              await verificationInput.type(formData[key], { delay: 100 });

              continue;
      }
      if(key === 'expiry' ){
        const cardNumberFrameHandle = await page.waitForSelector('iframe.card-fields-iframe[title="Field container for: Expiration date (MM / YY)"]');
        const expiryFrame = await cardNumberFrameHandle.contentFrame();

        // Wait for the input with id or name "expiry"
              const expiryInput = await expiryFrame.waitForSelector('input#expiry, input[name="expiry"]', { visible: true });    
              
              await expiryInput.focus();

              await expiryInput.type(formData[key], { delay: 100 });

              continue;
      }
     await page.waitForSelector('[name="'+key+'"]')
     await page.click('[name="'+key+'"]')
     await page.type('[name="'+key+'"]',formData[key])
}
  logWithTimestamp("submitting payment info address...");
  await page.click('[name=RememberMe]');
  const price = await page.$eval('strong._19gi7yt0._19gi7ytk._19gi7ytj._1fragempi._19gi7yt12._19gi7yt1a._19gi7yt1l.notranslate', element => element.textContent);
  logWithTimestamp(`total price: ${price}`);
    await page.click('[id^="DeprecatedCheckbox"]');
    taskSpeed = ((performance.now() - start)/1000).toFixed(2);
    logWithTimestamp(`Task Speed: ${taskSpeed}`);
    await Promise.all([
    page.waitForNavigation({ waitUntil: 'load' }),
    page.click('#checkout-pay-button'),
  ]);
  page.close();

}

 //const url = page.url(); for leaving the process page
// if (url.includes('some-unique-path-or-keyword')) {
//   console.log('Detected target page, pausing...');
//   await page.waitForTimeout(10000); // pause 10 seconds
// }
