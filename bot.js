const puppeteer = require('puppeteer');
let taskSpeed;
let start;
let winRef;

exports.setWindow = (win) => {
  winRef = win;
};

function logWithTimestamp(message) {
  if (!winRef) return; 
  const timestamp = new Date().toLocaleTimeString();
  const fullMessage = `${timestamp}: ${message}`;
  winRef.webContents.send('bot-message', fullMessage);
}

exports.getAvailableSizes = async (productUrl) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.waitForSelector('label.SizeSwatch', { timeout: 15000 });

    const sizes = await page.$$eval('label.SizeSwatch', labels =>
      labels
        .filter(label => !label.classList.contains('gb-change-color'))
        .map(label => ({
          label: label.textContent.trim(),
          value: label.getAttribute('for')
        }))
    );

    if (winRef) {
      winRef.webContents.send('available-sizes', sizes);
    }

  } catch (err) {
    logWithTimestamp(`Error fetching sizes: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};

exports.runScript = async (formData) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    start = performance.now();

    logWithTimestamp("Adding item to cart....");
    await page.goto(formData.productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  
    await page.waitForSelector(`label[for="${formData.shoeSize}"]`, { timeout: 15000 });
    await page.click(`label[for="${formData.shoeSize}"]`);


    await page.waitForSelector(".ProductForm__AddToCart", { timeout: 15000 });
    await page.click(".ProductForm__AddToCart");

    logWithTimestamp("Going to checkout page...");
    await page.waitForSelector('[name="checkout"]', { timeout: 15000 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }),
      page.click('[name="checkout"]'),
    ]);

    logWithTimestamp("Submitting address...");
    for (let key in formData) {
      if (["productUrl", "shoeSize"].includes(key)) continue;

      try {
        if (key === 'state') {
          await page.waitForSelector('[name="zone"]', { timeout: 10000 });
          await page.select('[name="zone"]', formData[key]);
          continue;
        }

        if (key === 'number') {
          logWithTimestamp("Filling out card details...");
          const cardNumberFrameHandle = await page.waitForSelector(
            'iframe.card-fields-iframe[title="Field container for: Card number"]',
            { timeout: 15000 }
          );
          const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
          await cardNumberFrame.waitForSelector('input', { timeout: 10000 });
          await cardNumberFrame.type('input', formData[key], { delay: 50 });
          continue;
        }

        if (key === 'verification_value') {
          const verificationFrameHandle = await page.waitForSelector(
            'iframe.card-fields-iframe[title="Field container for: Security code"]',
            { timeout: 15000 }
          );
          const verificationFrame = await verificationFrameHandle.contentFrame();
          const verificationInput = await verificationFrame.waitForSelector(
            'input#verification_value, input[name="verification_value"]',
            { visible: true, timeout: 10000 }
          );
          await verificationInput.type(formData[key], { delay: 100 });
          continue;
        }

        if (key === 'expiry') {
          const expiryFrameHandle = await page.waitForSelector(
            'iframe.card-fields-iframe[title="Field container for: Expiration date (MM / YY)"]',
            { timeout: 15000 }
          );
          const expiryFrame = await expiryFrameHandle.contentFrame();
          const expiryInput = await expiryFrame.waitForSelector(
            'input#expiry, input[name="expiry"]',
            { visible: true, timeout: 10000 }
          );
          await expiryInput.type(formData[key], { delay: 100 });
          continue;
        }

        await page.waitForSelector(`[name="${key}"]`, { timeout: 10000 });
        await page.type(`[name="${key}"]`, formData[key], { delay: 50 });
      } catch (err) {
        logWithTimestamp(`Failed to fill field "${key}": ${err.message}`);
      }
    }

    logWithTimestamp("Submitting payment info...");
    try {
      await page.click('[name=RememberMe]').catch(() => {});
      const price = await page.$eval(
        'strong._19gi7yt0._19gi7ytk._19gi7ytj._1fragempi._19gi7yt12._19gi7yt1a._19gi7yt1l.notranslate',
        el => el.textContent
      ).catch(() => "N/A");
      logWithTimestamp(`Total price: ${price}`);
      await page.click('[id^="DeprecatedCheckbox"]').catch(() => {});
    } catch (err) {
      logWithTimestamp(`Error before payment: ${err.message}`);
    }

    taskSpeed = ((performance.now() - start) / 1000).toFixed(2);
    logWithTimestamp(`Task Speed: ${taskSpeed}`);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(() => {}),
      page.click('#checkout-pay-button').catch(() => {}),
    ]);

  } catch (err) {
    logWithTimestamp(`Fatal error: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};
