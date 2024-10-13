require("dotenv").config();
const { sendMessage } = require("./lib/telegram");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const cloudinary = require("cloudinary").v2;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const pm2 = require("pm2");

cloudinary.config({
  cloud_name: "dl0dnzxur",
  api_key: "198927133892981",
  api_secret: "5_rjzxhLYHYuMf8uy-1zx47r5JY",
});

async function initializeDriver() {
  let options = new chrome.Options();
  // Add Chrome options as needed
  // options.addArguments("--headless"); // Running in headless mode
  // options.addArguments("--disable-gpu"); // Disabling GPU hardware acceleration
  // options.addArguments("--no-sandbox"); // Disabling the sandbox for running untrusted code
  // options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  return driver;
}

async function acceptCookies(driver) {
  await driver.get("https://blaze.com/pt/games/crazy-time");
  const acceptCookiesButton = By.xpath(
    "//button[contains(text(), 'ACEITAR TODOS OS COOKIES')]"
  );
  await driver.wait(until.elementLocated(acceptCookiesButton), 10000);
  const cookieButtonElement = await driver.findElement(acceptCookiesButton);
  await cookieButtonElement.click();
}

async function performLogin(driver) {
  const entrarButton = By.css("a.link");
  await driver.wait(until.elementLocated(entrarButton), 10000);
  await driver.findElement(entrarButton).click();

  // Wait for the login form to be visible
  const usernameField = By.css('input[name="username"]');
  const passwordField = By.css('input[name="password"]');
  await driver.wait(until.elementLocated(usernameField), 10000);
  await driver.wait(until.elementLocated(passwordField), 10000);

  // Populate the login form
  await driver.findElement(usernameField).sendKeys(email);
  await driver.findElement(passwordField).sendKeys(password);

  // Submit the login form
  const loginSubmitButton = By.css("button.red.submit");
  await driver.wait(until.elementLocated(loginSubmitButton), 10000);
  await driver.findElement(loginSubmitButton).click();
  await sendMessage("Attempting Login");
  console.log("Attempting Login");
  // Wait for successful login by checking for a logout button, profile link, or similar element
  const logoutButton = By.css(".wallet-dropdown"); // Replace with the actual selector for the logout button or profile link
  await driver.wait(until.elementLocated(logoutButton), 10000);
  console.log("Wallet dropdown found. Login confirmed.");
}

async function navigateToGame(driver) {
  const gameWrapperDiv = By.id("game_wrapper");
  await driver.wait(until.elementLocated(gameWrapperDiv), 10000);
  const iframeContainer = await driver.findElement(gameWrapperDiv);

  await driver.wait(async () => {
    const readyState = await driver.executeScript("return document.readyState");
    return readyState === "complete";
  }, 10000);

  // Locate the iframe within the div and switch to it
  // Wait for the iframe to be located within the div
  const iframeLocator = By.css("iframe");
  await driver.wait(until.elementLocated(iframeLocator), 100000);

  // Find the iframe and switch to it
  const iframe = await iframeContainer.findElement(iframeLocator);
  await driver.switchTo().frame(iframe);

  console.log("first iferame switched");
  // Now that we've switched to the iframe, check for the presence of an element with the class `.games-container`
  const gamesContainer = By.css(".games-container");
  await driver.wait(until.elementLocated(gamesContainer), 10000); // Wait up to 10 seconds
  console.log("Inside the iframe: .games-container found.");

  const secondIframeWithinGamesContainer = await driver.findElement(
    By.css(".games-container iframe")
  );
  await driver.switchTo().frame(secondIframeWithinGamesContainer);
}

const checkPulseClass = async (driver) => {
  const script = `
    const countdownDiv = document.querySelector('div[data-role="circle-timer"]');
    return countdownDiv ? true : false;
  `;

  return await driver.executeScript(script);
};
async function startMonitoring(driver) {
  let highLowCounter = 1;
  let lastGameWinningResult = null;
  let lastWinner = null;
  let startMessageSent = false;
  let endMessageSent = false;
  let resultShown = false;
  let countdownStarted = false;
  let startTime;
  let tieHandled = false;

  let lowBetHighPopulationCounter = 0;
  let highBetLowPopulationCounter = 0;
  let counter = 1;
  let lastGameResult;
  let tieTimeoutActive = false;
  setInterval(async () => {
    try {
      const hasPulseClass = await checkPulseClass(driver);
      console.log(hasPulseClass, "monitoring ");

      if (hasPulseClass && !countdownStarted) {
        countdownStarted = true;
        startTime = new Date();
      }
      if (countdownStarted && !startMessageSent) {
        // While countdown is active, log the remaining time
        const elapsedSeconds = (new Date() - startTime) / 1000;

        if (elapsedSeconds >= 9) {
          // Send start game message

          console.log(elapsedSeconds);

          startMessageSent = true;
          endMessageSent = false;
        }
      }

      if (!hasPulseClass && countdownStarted && !endMessageSent) {
        // Countdown has ended
        countdownStarted = false;
        // endMessageSent = true; // Ensure end message is sent only once

        console.log("Countdown ended");
      }
    } catch (err) {
      console.log(err);
    }
  }, 800);
}

async function waitForElement(driver, locator, timeout = 10000) {
  try {
    // Wait until the element is located and return it
    await driver.wait(until.elementLocated(locator), timeout);
    const element = await driver.findElement(locator);
    return element;
  } catch (error) {
    console.error(`Error: Element ${locator} not found within ${timeout}ms`);
    throw error;
  }
}
async function closeBannerIfPresent(driver) {
  try {
    const bannerCloseButton = await waitForElement(
      driver,
      By.id("forced-banner-close"),
      5000
    );
    if (bannerCloseButton) {
      await bannerCloseButton.click();
      console.log("Banner closed successfully.");
    }
  } catch (error) {
    console.log("No banner present or failed to close banner.");
  }
}

async function clickCloseChatButton(driver) {
  try {
    // Wait for the close chat button to be present
    const closeButton = await waitForElement(
      driver,
      By.id("close-chat"),
      10000
    );

    // Check if the element is visible and enabled
    const isVisible = await closeButton.isDisplayed();
    const isEnabled = await closeButton.isEnabled();

    if (isVisible && isEnabled) {
      await closeButton.click();
      console.log("Close chat button clicked.");
    } else {
      console.log(
        "Close chat button is not interactable (not visible or not enabled)."
      );
    }
  } catch (error) {
    console.error("Failed to click the close chat button:", error);
  }
}

async function monitorPercentages() {
  const driver = await initializeDriver();
  try {
    await acceptCookies(driver);
    await performLogin(driver);
    await navigateToGame(driver);
    await startMonitoring(driver);
  } catch (error) {
    console.error("Error during monitoring process:", error);

    const base64Data = await driver.takeScreenshot();
    cloudinary.uploader.upload(
      `data:image/png;base64,${base64Data}`,
      { folder: "selenium_screenshots" },
      function (error, result) {
        if (error) console.error("Upload to Cloudinary failed:", error);
        else {
          console.log("Screenshot uploaded successfully. URL:", result.url);
          pm2.connect(function (err) {
            if (err) {
              console.error(err);
              process.exit(2);
            }

            // Restart a specific process by its name or id
            pm2.restart("newGambler", function (err) {
              pm2.disconnect(); // Disconnects from PM2
              if (err) {
                console.error("PM2 restart failed:", err);
              } else {
                console.log("PM2 process restarted successfully.");
              }
            });
          });
        }
      }
    );

    // await restartProcess(driver);
  }
}

monitorPercentages();
