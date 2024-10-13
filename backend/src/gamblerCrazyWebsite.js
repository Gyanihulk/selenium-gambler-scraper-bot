require("dotenv").config();
const { sendMessage } = require("./lib/telegram");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const pm2 = require("pm2");

const { cloudinary } = require("./config/cloudinary");
const { lpushAsync } = require("./config/redisConfig");
const { formatResultsWithEmojis } = require("./lib/helpers");
const {
  acceptCookies,
  closeAdvertisingModal,
  closeAdvertisingModalSimple,
} = require("./lib/crazyTimeWebHelpers");
const {
  placeBet,
  updateBetResults,
  analyzeBets,
  placeMultipleBets,
} = require("./lib/crazyTimeWebBetHelpers");
try {
  // Create a Redis client

  async function initializeDriver() {
    let options = new chrome.Options();
    if (process.env.ENV == "PROD") {
      // Add Chrome options as needed
      options.addArguments("--headless"); // Running in headless mode
      options.addArguments("--disable-gpu"); // Disabling GPU hardware acceleration
      options.addArguments("--no-sandbox"); // Disabling the sandbox for running untrusted code
      options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems
    }

    let driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    return driver;
  }

  async function openWebsite(driver) {
    await driver.get("https://gamblingcounting.com/crazy-time");
  }

  async function startMonitoring(driver) {
    // Track last update time for Redis storage
    let lastResult = {}; // Keep track of the last result added to queue
    let resultsQueue = [];
    let roundCounter = 0; // This will keep track of the current round number

    setInterval(async () => {
      try {
        let multiplierValue
        try {
          const multiplierElement = await driver.findElement(
            By.css(".ct-live-result__value-multi")
          );
           multiplierValue = await multiplierElement.getText();
        } catch (error) {
          console.log("No multipliyer ")
          multiplierValue = "MISS";
        }
        

        const mainValueElement = await driver.findElement(
          By.css(".ct-live-result__value-main img")
        );
        const mainValueAltText = await mainValueElement.getAttribute("alt");

        const slotValueElement = await driver.findElement(
          By.css(".ct-live-result__value-slot img")
        );
        const slotValueAltText = await slotValueElement.getAttribute("alt");

        const result = {
          multiplier: multiplierValue.replace("x", ""),
          mainValue: mainValueAltText.replace(/^Crazy Time\s*/, ""),
          slotValue: slotValueAltText.replace(/^Crazy Time\s*/, ""),
          timestamp: Date.now(),
          roundNumber: roundCounter, // Add the round number to the result
        };

        console.log(
          `🔍 Fetched Result: 🎲 Multiplier: ${result.multiplier}, 🏆 Main Value: ${result.mainValue}, 🎰 Slot Value: ${result.slotValue}`
        );

        const currentTime = Date.now();
        if (currentTime - lastResult.timestamp > 1000) {
          // Update every 10 seconds
          console.log("🔄 Updating bet results...");
          await updateBetResults(roundCounter); // Update bets based on current round
          await analyzeBets(roundCounter); // Analyze the current bets
        }
        // Check if result is unique and timed appropriately
        if (
          resultsQueue.length === 0 ||
          currentTime - lastResult.timestamp > 9000
        ) {
          resultsQueue.push(result);
          lastResult = result; // Update last result

          // Maintain only the last 3 results
          if (resultsQueue.length > 3) {
            resultsQueue.shift();
          }

          console.log("Updated resultsQueue:", resultsQueue);
          sendMessage(
            `🆕 Game Results: \n\n${formatResultsWithEmojis(resultsQueue)}`,
            process.env.CRAZYTIME_TRACK
          );

          // Push the result to Redis
          await lpushAsync("gameResults", JSON.stringify(result));

          // Increment roundCounter after processing this result
          roundCounter++;

          lastRedisUpdateTime = currentTime;
        }

        // Logic for placing bets based on specific patterns in resultsQueue
        if (
          resultsQueue.length === 3 &&
          resultsQueue[0].mainValue === "2" &&
          resultsQueue[0].multiplier &&
          resultsQueue[1].mainValue === "1" &&
          resultsQueue[2].mainValue === "1"
        ) {
          console.log("Bet on 🔟. Follow it for 3 rounds.");
          sendMessage(
            "Bet on 🔟. Follow it for 3 rounds.",
            process.env.CRAZYTIME_RESULT
          );
          placeMultipleBets(10, roundCounter, 3); // Place a bet for 3 rounds
        }

        if (resultsQueue.length === 3) {
          if (
            resultsQueue[0].mainValue === "1" &&
            resultsQueue[1].mainValue === "2" &&
            resultsQueue[2].mainValue === "2"
          ) {
            console.log("Bet on 🔟. Follow it for 1 round.");
            sendMessage(
              "Bet on 🔟. Follow it for 1 round.",
              process.env.CRAZYTIME_RESULT
            );
            placeMultipleBets(10, roundCounter, 3); // Place a bet for 1 round
          }
        }

        // Testing bets tracking
        // if (resultsQueue.length === 1) {
        //   console.log("Bet on 🔟. Follow it for 4 rounds.");
        //   sendMessage(
        //     "Bet on 🔟. Follow it for 4 rounds.",
        //     process.env.CRAZYTIME_RESULT
        //   );
        //   placeMultipleBets(10, roundCounter, 4); // Place a bet for 4 rounds
        // }

        // Check if it's time to update bets
       
      } catch (err) {
        if (err.name === "NoSuchElementError") {
          console.log("⌛ Waiting for element to be available...");
        } else {
          console.error("❗ Unexpected error:", err);
        }
      }
      closeAdvertisingModalSimple(driver);
    }, 800); // Interval set to 800 milliseconds
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

  async function monitorPercentages() {
    // Promisify Redis client methods for async/await
    // const lpushAsync = promisify(client.lpush).bind(client);

    const driver = await initializeDriver();
    try {
      await openWebsite(driver);
      acceptCookies(driver);
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
              pm2.restart("gamblerCrazyWebsite", function (err) {
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

  module.exports = {
    monitorPercentages,
  };
} catch (error) {
  console.log(error);
}
