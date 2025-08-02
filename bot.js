const puppeteer = require('puppeteer');

async function runScript(formData) {
  console.log('Bot received:', formData);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(formData.productUrl);
  console.log(`Navigated to ${formData.productUrl}`);

  // Use other formData fields here
  console.log('label[for="option-0-'+formData.shoeSize+'"]');

  await page.waitForSelector('label[for="option-0-'+formData.shoeSize+'"]');

// Click the element
    await page.click('label[for="option-0-'+formData.shoeSize+'"]');

    await page.click(".ProductForm__AddToCart");

    await page.waitForSelector('[name="checkout"]')

    //await page.click('[name="checkout"]');

    await Promise.all([
   page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('[name="checkout"]'),
  ]);

  for (let key in formData) {
      if(key === 'productUrl' || key === 'shoeSize') continue;

      if(key === 'state'){
        await page.waitForSelector('[name="zone"]')
        await page.select('[name="zone"]', formData[key]);
        continue;
      }
      if(key === 'number' ){
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
 
    await page.click('[id^="DeprecatedCheckbox"]');
    await page.click('#checkout-pay-button');


}

 //const url = page.url(); for leaving the process page
// if (url.includes('some-unique-path-or-keyword')) {
//   console.log('Detected target page, pausing...');
//   await page.waitForTimeout(10000); // pause 10 seconds
// }

module.exports = runScript;