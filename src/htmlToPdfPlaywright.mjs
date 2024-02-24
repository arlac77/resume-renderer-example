import playwright from "playwright";

const path = new URL(".", import.meta.url).pathname;

(async () => {
  const browser = await playwright.chromium.launch(/*{ headless: false }*/);
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(
    `file://${path}/max_mustermann_de.html`
  );
  //await page.waitForTimeout(2000);
  await page.pdf({ path: `max_mustermann_de.htmlTO.pdf`, printBackground: true });
  await browser.close();
})();
