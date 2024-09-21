require("dotenv").config();
const { sendMessage } = require("./lib/telegram");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const cloudinary = require("cloudinary").v2;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

cloudinary.config({
  cloud_name: "dl0dnzxur",
  api_key: "198927133892981",
  api_secret: "5_rjzxhLYHYuMf8uy-1zx47r5JY",
});

async function initializeDriver() {
  let options = new chrome.Options();
  // Add Chrome options as needed
  options.addArguments("--headless"); // Running in headless mode
  options.addArguments("--disable-gpu"); // Disabling GPU hardware acceleration
 options.addArguments("--no-sandbox"); // Disabling the sandbox for running untrusted code
  options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  return driver;
}

async function acceptCookies(driver) {
  await driver.get("https://blaze-7.com/pt/games/bac-bo");
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
async function findCountdownDiv(driver, timeout) {
  const bettingContainer = By.css(
    "div.gradient--112b5.external--6539c.betting--ae3ee.whiteTheme--2f223"
  );
  await driver.wait(until.elementLocated(bettingContainer), 15000);
  const containerElement = await driver.findElement(bettingContainer);
  // If countdownDiv is found, return it immediately
  if (containerElement) {
    return containerElement;
  }

  // If countdownDiv is not found, wait for a short duration and retry
  await driver.sleep(1000); // Adjust the waiting time as needed

  // If timeout is reached, throw an error
  if (timeout <= 0) {
    throw new Error(`Countdown div not found after ${timeout} milliseconds`);
  }

  // Recursively call the function with a reduced timeout
  return findCountdownDiv(driver, timeout - 1000);
}

async function startMonitoring(driver) {
  const countdownDiv = await findCountdownDiv(driver, 10000); // Adjust the timeout as needed
  console.log("Countdown timer div found:");

  const checkPulseClass = async () => {
    const script = `
      const countdownDiv = document.querySelector('div[data-role="circle-timer"]');
      return countdownDiv ? true : false;
    `;

    return await driver.executeScript(script);
  };

  const getPlayerDiceResults = async () => {
    const script = `
          const playerDiceResultsDiv = document.querySelector('.content--0f6cb .content--8fdbb.player--b0a44 .diceResults--07087');
          if (playerDiceResultsDiv) {
            const diceElements = playerDiceResultsDiv.querySelectorAll('.dieResult--879b3');
            const diceResults = Array.from(diceElements).map(die => {
              const valueClass = Array.from(die.classList).find(className => className.startsWith('value'));
              return valueClass ? parseInt(valueClass.match(/value(\\d+)--/)[1], 10) : null;
            });
            
            const totalResultElement = playerDiceResultsDiv.querySelector('.result--709b0');
            const totalResult = totalResultElement ? parseInt(totalResultElement.textContent.trim(), 10) : null;
            
            return { diceResults, totalResult };
          }
          return null;
        `;

    return await driver.executeScript(script);
  };

  const getBankerDiceResults = async () => {
    const script = `
          const bankerDiceResultsDiv = document.querySelector('.content--0f6cb .content--8fdbb.banker--cf253 .diceResults--07087');
          if (bankerDiceResultsDiv) {
            const diceElements = bankerDiceResultsDiv.querySelectorAll('[class*="dieResult--"]');
            const diceResults = Array.from(diceElements).map(die => {
              const valueClass = Array.from(die.classList).find(className => className.startsWith('value'));
              return valueClass ? parseInt(valueClass.match(/value(\\d+)--/)[1], 10) : null;
            });
      
            const totalResultElement = bankerDiceResultsDiv.querySelector('.result--709b0');
            const totalResult = totalResultElement ? parseInt(totalResultElement.textContent.trim(), 10) : null;
      
            return { diceResults, totalResult };
          }
          return null;
        `;

    return await driver.executeScript(script);
  };

  const getBetStatsInfoPlayer = async () => {
    const script = `
          const playerInfoDiv = document.querySelector('.betSpot--1133f.player--936df .content--0f6cb');
          if (playerInfoDiv) {
            const playerPercentage = playerInfoDiv.querySelector('.svgPercentIndicator--f0e76 .value--2f068') ? playerInfoDiv.querySelector('.svgPercentIndicator--f0e76 .value--2f068').textContent.trim() : null;
            const playerAmount = playerInfoDiv.querySelector('.amount--188f7') ? playerInfoDiv.querySelector('.amount--188f7').textContent.trim() : null;
            const playerPlayers = playerInfoDiv.querySelector('.players--ad032') ? playerInfoDiv.querySelector('.players--ad032').textContent.trim() : null;
            const playerCoefficient = playerInfoDiv.querySelector('.coefficient--f825f') ? playerInfoDiv.querySelector('.coefficient--f825f').textContent.trim() : null;
            const playerName = playerInfoDiv.querySelector('.name--be392') ? playerInfoDiv.querySelector('.name--be392').textContent.trim() : null;
            return { playerPercentage, playerAmount, playerPlayers, playerCoefficient, playerName };
          }
          return null;
        `;

    return await driver.executeScript(script);
  };

  // ... existing code ...

  const getBankerInfo = async () => {
    const script = `
          const bankerInfoDiv = document.querySelector('.betSpot--1133f.banker--cff3f .content--0f6cb');
          if (bankerInfoDiv) {
            const bankerAmount = bankerInfoDiv.querySelector('.amount--188f7') ? bankerInfoDiv.querySelector('.amount--188f7').textContent.trim() : null;
            const bankerPlayers = bankerInfoDiv.querySelector('.players--ad032') ? bankerInfoDiv.querySelector('.players--ad032').textContent.trim() : null;
            const bankerPercentage = bankerInfoDiv.querySelector('.svgPercentIndicator--f0e76 .value--2f068') ? bankerInfoDiv.querySelector('.svgPercentIndicator--f0e76 .value--2f068').textContent.trim() : null;
            const bankerCoefficient = bankerInfoDiv.querySelector('.coefficient--f825f') ? bankerInfoDiv.querySelector('.coefficient--f825f').textContent.trim() : null;
            const bankerName = bankerInfoDiv.querySelector('.name--be392') ? bankerInfoDiv.querySelector('.name--be392').textContent.trim() : 'BANKER';
            return { bankerAmount, bankerPlayers, bankerPercentage, bankerCoefficient, bankerName };
          }
          return null;
        `;

    return await driver.executeScript(script);
  };

  // ... existing code ...

  // Check for the "BANKER" information
  const getCurrentTimeString = () => {
    return new Date().toLocaleTimeString(); // You can adjust the format as needed
  };

  let lastWinner = null;

  const checkWinningResult = async (driver) => {
    const script = `
          const playerWinningDiv = document.querySelector('[data-role="game-result-player-wins"]');
          const bankerWinningDiv = document.querySelector('[data-role="game-result-banker-wins"]'); // Update this selector based on the actual data-role for banker wins if it's different
          const tieDiv = document.querySelector('[data-role="game-result-tie"]'); // Update this selector based on the actual data-role for tie if it's different
          let result = 'none';
          if (playerWinningDiv) {
            result = 'player';
          } else if (bankerWinningDiv) {
            result = 'banker';
          } else if (tieDiv) {
            result = 'tie';
          }
      
          return result;
        `;

    const currentWinner = await driver.executeScript(script);

    // Check if the result has changed since the last check
    if (currentWinner !== lastWinner) {
      // Update the last winner to the current winner
      lastWinner = currentWinner;
      // Return the new winner
      return currentWinner;
    }

    // If the result hasn't changed, return 'none' to indicate no update
    return "none";
  };

  const checkAndClickPlayButton = async (driver) => {
    const script = `
      const playButton = document.querySelector('[data-role="play-button"]');
      if (playButton && playButton.offsetHeight > 0 && playButton.offsetWidth > 0) {
        console.log("Play button found and about to be clicked:", playButton);
        playButton.click(); // Click the play button
        return true; // Return true to indicate that the button was clicked
      } else {
        console.log("Play button not found or not visible");
      }
      return false; // Return false if the play button was not found or not visible
    `;
    return await driver.executeScript(script);
  };

  const checkAndClickFooter = async (driver) => {
    const script = `
          const okButton = document.querySelector('[data-role="footer-left"]');
          if (okButton && okButton.offsetHeight > 0 && okButton.offsetWidth > 0) {
            console.log("foooter clicked", okButton);
            okButton.click(); // Click the OK button
            return true; // Return true to indicate that the button was clicked
          }
          return false; // Return false if the OK button was not found or not visible
        `;
    return await driver.executeScript(script);
  };

  const checkAndClickInactivityMessageClickable = async (driver) => {
    const script = `
          const clickableDiv = document.querySelector('div[data-role="inactivity-message-clickable"]');
          if (clickableDiv) {
            clickableDiv.click(); // Click the div to handle the inactivity
            return true; // Return true to indicate that the div was clicked
          }
          return false; // Return false if the div was not found
        `;
    return await driver.executeScript(script);
  };

  let startMessageSent = false;
  let endMessageSent = false;
  let resultShown = false;
  let countdownStarted = false;
  let startTime;

  let lastBankerBetAmount = 0;
  let lastPlayerBetAmount = 0;
  let lastBankerPopulation = 0;
  let lastPlayerPopulation = 0;
  let lowBetHighPopulationCounter = 0;
  let counter = 1;
  let lastGameResult;
  setInterval(async () => {
    try {
      const hasPulseClass = await checkPulseClass();
      const playerInfo = await getBetStatsInfoPlayer();
      const playerDiceResults = await getPlayerDiceResults();
      const bankerInfo = await getBankerInfo(); // Make sure you have this function defined to get bet stats for BANKER
      const bankerDiceResults = await getBankerDiceResults();
      const winningResult = await checkWinningResult(driver);
      let currentGameResult;

      const playButtonClicked = await checkAndClickPlayButton(driver);

      if (playButtonClicked) {
        console.log("Play button clicked to resume the game from inactivity.");
        await sendMessage(
          "Play button clicked to resume the game from inactivity."
        );
      }

      checkAndClickFooter(driver);
      const clickableDivClicked = await checkAndClickInactivityMessageClickable(
        driver
      );
      if (clickableDivClicked) {
        console.log("Inactivity message clickable div clicked.");
      }
      if (!endMessageSent && winningResult) {
        message = "";

        if (winningResult === "player") {
          console.log("Player wins", playerDiceResults);
          currentGameResult =
            lastPlayerBetAmount > lastBankerBetAmount ? "High" : "Low";

          if (
            lastPlayerPopulation > lastBankerPopulation &&
            lastPlayerBetAmount < lastBankerBetAmount
          ) {
            lowBetHighPopulationCounter++;
            message += `${currentGameResult} Player ${counter} - Low Bet by High Pop`;
          } else {
            message += `${currentGameResult} Player ${counter}`;
          }
          if (lastGameResult == currentGameResult) {
            counter++;
          } else {
            counter = 1;
          }
          console.log(lastGameResult, currentGameResult);
          lastGameResult = currentGameResult;
        } else if (winningResult === "banker") {
          console.log("Banker wins", bankerDiceResults);
          currentGameResult =
            lastBankerBetAmount > lastPlayerBetAmount ? "High" : "Low";
          if (lastGameResult == currentGameResult) {
            counter++;
          } else {
            counter = 1;
          }
          if (
            lastBankerPopulation > lastPlayerPopulation &&
            lastBankerBetAmount < lastPlayerBetAmount
          ) {
            lowBetHighPopulationCounter++;
            message += `${currentGameResult} Banker ${counter} - Low Bet by High Pop`;
          } else {
            message += `${currentGameResult} Banker ${counter}`;
          }
          console.log(lastGameResult, currentGameResult);
          lastGameResult = currentGameResult;
        } else if (
          winningResult === "tie" &&
          playerDiceResults &&
          bankerDiceResults &&
          playerDiceResults?.totalResult === bankerDiceResults?.totalResult &&
          !bankerDiceResults?.diceResults?.includes(null) &&
          !playerDiceResults?.diceResults?.includes(null)
        ) {
          if (bankerDiceResults?.totalResult) {
            counter++;
            message += lastGameResult + " " + counter;
            message += " Tie ";
            switch (bankerDiceResults.totalResult) {
              case 2:
              case 12:
                message += "88x";
                break;
              case 3:
              case 11:
                message += "25x";
                break;
              case 4:
              case 10:
                message += "10x";
                break;
              case 5:
              case 9:
                message += "6x";
                break;
              case 6:
              case 7:
              case 8:
                message += "4x";
                break;
              default:
                message += bankerDiceResults.totalResult;
            }
          }
        }

        // if(lastGameResult && currentGameResult){
        //   console.log(lastGameResult,currentGameResult,"before updating")
        //   lastGameResult = currentGameResult;
        // }

        const sendStatus = await sendMessage(message);

        startMessageSent = false;
        endMessageSent = true;
      }

      if (hasPulseClass && !countdownStarted) {
        countdownStarted = true;
        startTime = new Date();
      }

      if (countdownStarted && !startMessageSent) {
        // While countdown is active, log the remaining time
        const elapsedSeconds = (new Date() - startTime) / 1000;

        if (elapsedSeconds >= 9) {
          // Send start game message

          console.log(bankerInfo, playerInfo);
          const botMessage = `
            Player Bet: ${playerInfo?.playerAmount} (${
            playerInfo?.playerCoefficient
          })
  Players on Player: ${playerInfo?.playerPlayers} (${
            playerInfo?.playerPercentage
          })
  
  Banker Bet: ${bankerInfo?.bankerAmount} (${bankerInfo?.bankerCoefficient})
  Players on Banker: ${bankerInfo?.bankerPlayers} (${
            bankerInfo?.bankerPercentage
          })
  
  Remaning Time: ${12 - parseInt(elapsedSeconds)} seconds
  `;
          if (bankerInfo?.bankerAmount) {
            sendMessage(botMessage);
            lastBankerBetAmount = parseFloat(
              bankerInfo?.bankerAmount.replace(/[\$,]/g, "")
            );
            lastPlayerBetAmount = parseFloat(
              playerInfo?.playerAmount.replace(/[\$,]/g, "")
            );
            lastBankerPopulation = parseInt(bankerInfo?.bankerPlayers);
            lastPlayerPopulation = parseInt(playerInfo?.playerPlayers);
            lastBankerPercentage = parseInt(
              bankerInfo?.bankerPercentage.replace(/[\%,]/g, "")
            );
            lastPlayerPercentage = parseInt(
              playerInfo?.playerPercentage.replace(/[\%,]/g, "")
            );
          }

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

      if (endMessageSent) {
        startMessageSent = false;
        endMessageSent = false;
        resultShown = false;
      }
    } catch (err) {
      console.log(err);
    }
  }, 500);

  async function preventInactivityClick(driver) {
    const script = `
      const body = document.querySelector('body');
      if (body) {
        body.click(); // Click on the body of the page to simulate activity
        return true; // Indicate that the click was performed
      }
      return false; // Return false if the body element is not found
    `;
    return await driver.executeScript(script);
  }

  // Call this function every 5 minutes to prevent inactivity
  setInterval(async () => {
    try {
      const clicked = await preventInactivityClick(driver);
      if (clicked) {
        console.log("Prevented inactivity by clicking on the page.");
      } else {
        console.log("Failed to prevent inactivity, body element not found.");
      }
    } catch (err) {
      console.log("Error while preventing inactivity:", err);
    }
  }, 300000);
}

const checkAndClickOkButton = async (driver) => {
  const script = `
        const okButton = document.querySelector('[data-role="button-ok"]');
        if (okButton && okButton.offsetHeight > 0 && okButton.offsetWidth > 0) {
          console.log("OK button found", okButton);
          okButton.click(); // Click the OK button
          return true; // Return true to indicate that the button was clicked
        }
        return false; // Return false if the OK button was not found or not visible
      `;
  return await driver.executeScript(script);
};
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

async function restartProcess(driver) {
  try {
    console.log("Restarting process...");
    await driver.navigate().refresh(); // Refresh the page

    // Wait for page to load
    await driver.wait(async () => {
      const readyState = await driver.executeScript(
        "return document.readyState"
      );
      return readyState === "complete";
    }, 20000); // Increased wait time for page load
    await closeBannerIfPresent(driver);
    await clickCloseChatButton(driver);
    await performLogin(driver); // Perform login again
    await switchToGameIframe(driver); // Navigate to the game iframe
    await startMonitoring(driver); // Restart monitoring
    console.log("Restart process completed successfully.");
  } catch (error) {
    console.error("Error during restart process:", error);

    const base64Data = await driver.takeScreenshot();
    cloudinary.uploader.upload(
      `data:image/png;base64,${base64Data}`,
      { folder: "selenium_screenshots" },
      function (error, result) {
        if (error) console.error("Upload to Cloudinary failed:", error);
        else console.log("Screenshot uploaded successfully. URL:", result.url);
      }
    );

    await restartProcess(driver); // Retry the restart if it fails
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
        else console.log("Screenshot uploaded successfully. URL:", result.url);
      }
    );

    // await restartProcess(driver);
  }
}

monitorPercentages();
