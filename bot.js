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
      if(key === 'state' || key === 'productUrl' || key === 'shoeSize' || key === 'email') continue;
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
        await cardNumberFrame.waitForSelector('input')
        await cardNumberFrame.type('input',formData[key]);
        continue;
      }
      if(key === 'expiry' ){
        const cardNumberFrameHandle = await page.waitForSelector('iframe.card-fields-iframe[title="Field container for: Expiration date (MM / YY)"]');
        const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
        await cardNumberFrame.waitForSelector('input')
        await cardNumberFrame.type('input',formData[key]);
        continue;
      }
      await page.waitForSelector('[name="'+key+'"]')
     await page.click('[name="'+key+'"]')
     await page.type('[name="'+key+'"]',formData[key])
}
 
    // await page.waitForSelector('[name="firstName"]')
    // await page.click('[name="firstName"]')
    // await page.type('[name="firstName"]',formData.firstName);

    // await page.waitForSelector('[name="lastName"]')
    // await page.click('[name="lastName"]')
    // await page.type('[name="lastName"]',formData.lastName);

    // await page.waitForSelector('[name="address1"]')
    // await page.click('[name="address1"]')
    // await page.type('[name="address1"]',formData.address);
    
    // if(formData.optionalAddress != "");{
    //   await page.waitForSelector('[name="address2"]')
    //   await page.click('[name="address2"]')
    //   await page.type('[name="address2"]',formData.optionalAddress);
    // }

    // await page.waitForSelector('[name="city"]')
    // await page.click('[name="city"]')
    // await page.type('[name="city"]',formData.city);

    // await page.waitForSelector('[name="city"]')
    // await page.click('[name="city"]')
    // await page.type('[name="city"]',formData.city);


    



}

 //const url = page.url(); for leaving the process page
// if (url.includes('some-unique-path-or-keyword')) {
//   console.log('Detected target page, pausing...');
//   await page.waitForTimeout(10000); // pause 10 seconds
// }

module.exports = runScript;