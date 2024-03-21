const { Builder, By, until } = require("selenium-webdriver");

async function monitorPercentages() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("https://blaze-7.com/pt/games/bac-bo");

    // ... Perform login steps before this ...
    const entrarButton = By.css("a.link");
    await driver.wait(until.elementLocated(entrarButton), 100);
    await driver.findElement(entrarButton).click();

    // Wait for the login form to be visible
    const usernameField = By.css('input[name="username"]');
    const passwordField = By.css('input[name="password"]');
    await driver.wait(until.elementLocated(usernameField), 1000);
    await driver.wait(until.elementLocated(passwordField), 1000);

    // Populate the login form
    await driver.findElement(usernameField).sendKeys("Desiboy25raja@gmail.com");
    await driver.findElement(passwordField).sendKeys("Desidesi@123");

    // Submit the login form
    const loginSubmitButton = By.css("button.red.submit");
    await driver.wait(until.elementLocated(loginSubmitButton), 10000);
    await driver.findElement(loginSubmitButton).click();
    console.log("Login .");
    // Wait for successful login by checking for a logout button, profile link, or similar element
    const logoutButton = By.css(".wallet-dropdown"); // Replace with the actual selector for the logout button or profile link
    await driver.wait(until.elementLocated(logoutButton), 10000);
    console.log("Wallet dropdown found. Login confirmed.");

    const gameWrapperDiv = By.id("game_wrapper");
    await driver.wait(until.elementLocated(gameWrapperDiv), 10000);
    const iframeContainer = await driver.findElement(gameWrapperDiv);

    // Locate the iframe within the div and switch to it
    const iframe = await iframeContainer.findElement(By.css("iframe"));
    await driver.switchTo().frame(iframe);

    // Now that we've switched to the iframe, check for the presence of an element with the class `.games-container`
    const gamesContainer = By.css(".games-container");
    await driver.wait(until.elementLocated(gamesContainer), 10000); // Wait up to 10 seconds
    console.log("Inside the iframe: .games-container found.");

    const secondIframeWithinGamesContainer = await driver.findElement(
      By.css(".games-container iframe")
    );
    await driver.switchTo().frame(secondIframeWithinGamesContainer);

    // Now that we are inside the second iframe, find the div with data-role="countdown-timer" and the specific class
    const countdownTimerDiv = By.css(
      'div[data-role="countdown-timer"].countdown--2398a.desktop--57cd3'
    );
    await driver.wait(until.elementLocated(countdownTimerDiv), 10000);
    console.log("Countdown timer div found inside the second iframe.");

    const checkPulseClass = async () => {
      const script = `
    const countdownDiv = document.querySelector('div[data-role="circle-timer"]');
    return countdownDiv ? true : false;
  `;

      return await driver.executeScript(script);
    };

    let countdownStarted = false;
    let startTime;
    let endTime;

    // Periodically check for the pulse class to determine start and end of countdown
    // Periodically check for the pulse class to determine start and end of countdown
    setInterval(async () => {
      const hasPulseClass = await checkPulseClass();
      if (hasPulseClass && !countdownStarted) {
        // Countdown has started
        countdownStarted = true;
        startTime = new Date(new Date() - 1000); // Adjust start time to 1 second earlier
        console.log("Countdown started");
      } else if (countdownStarted) {
        // While countdown is active, log the remaining time
        const currentTime = new Date();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        // Check if we need to adjust the first second display
        const adjustedElapsedSeconds = elapsedSeconds < 1 ? 1 : elapsedSeconds;
        console.log(
          `Countdown in progress. Time elapsed: ${adjustedElapsedSeconds.toFixed(
            2
          )} seconds.`
        );
      }

      if (!hasPulseClass && countdownStarted) {
        // Countdown has ended
        countdownStarted = false;
        endTime = new Date();
        const duration = (endTime - startTime) / 1000; // Calculate duration in seconds
        const adjustedDuration = duration < 12 ? 12 : duration; // Ensure at least 12 seconds
        console.log(
          `Countdown ended. Duration was ${adjustedDuration.toFixed(
            2
          )} seconds.`
        );
      }
    }, 1000);

    const getPlayerDiceResults = async () => {
      const script = `
            const playerDiceResultsDiv = document.querySelector('.content--69b27.player--9442a .diceResults--e67fe');
            if (playerDiceResultsDiv) {
              const diceElements = playerDiceResultsDiv.querySelectorAll('.dieResult--ef260');
              const diceResults = Array.from(diceElements).map(die => {
                const valueClassPrefix = 'value';
                const dieClassList = Array.from(die.classList);
                const valueClass = dieClassList.find(className => className.startsWith(valueClassPrefix));
                return valueClass ? parseInt(valueClass.match(/\\d+/)[0], 10) : null;
              });
        
              const totalResultElement = playerDiceResultsDiv.querySelector('.result--e6ea2');
              const totalResult = totalResultElement ? parseInt(totalResultElement.textContent.trim(), 10) : null;
        
              return { diceResults, totalResult };
            }
            return null;
          `;

      return await driver.executeScript(script);
    };

    const getBetStatsInfoPlayer = async () => {
      const script = `
            const playerInfoDiv = document.querySelector('.content--69b27.player--9442a');
            if (playerInfoDiv) {
              const playerPercentage = playerInfoDiv.querySelector('.value--d9c0b') ? playerInfoDiv.querySelector('.value--d9c0b').textContent.trim() : null;
              const playerAmount = playerInfoDiv.querySelector('.amount--4976c') ? playerInfoDiv.querySelector('.amount--4976c').textContent.trim() : null;
              const playerPlayers = playerInfoDiv.querySelector('.players--06980') ? playerInfoDiv.querySelector('.players--06980').textContent.trim() : null;
              const playerCoefficient = playerInfoDiv.querySelector('.coefficient--e278b') ? playerInfoDiv.querySelector('.coefficient--e278b').textContent.trim() : null;
              const playerName = playerInfoDiv.querySelector('.name--74e95') ? playerInfoDiv.querySelector('.name--74e95').textContent.trim() : null;
              return { playerPercentage, playerAmount, playerPlayers, playerCoefficient, playerName };
            }
            return null;
          `;

      return await driver.executeScript(script);
    };

    // ... existing code ...

    setInterval(async () => {
      const playerInfo = await getBetStatsInfoPlayer();
      const playerDiceResults = await getPlayerDiceResults();

      if (playerInfo?.playerAmount) {
        console.log("Player bet information:", playerInfo);
      }

      if (playerDiceResults) {
        console.log(
          "Player dice results:",
          playerDiceResults.diceResults,
          "Total result:",
          playerDiceResults.totalResult
        );
      }
    }, 1000);

    const getBankerDiceResults = async () => {
      const script = `
            const bankerDiceResultsDiv = document.querySelector('.content--69b27.banker--90e20 .diceResults--e67fe');
            if (bankerDiceResultsDiv) {
              const diceElements = bankerDiceResultsDiv.querySelectorAll('.dieResult--ef260');
              const diceResults = Array.from(diceElements).map(die => {
                const valueClassPrefix = 'value';
                const dieClassList = Array.from(die.classList);
                const valueClass = dieClassList.find(className => className.startsWith(valueClassPrefix));
                return valueClass ? parseInt(valueClass.match(/\\d+/)[0], 10) : null;
              });
        
              const totalResultElement = bankerDiceResultsDiv.querySelector('.result--e6ea2');
              const totalResult = totalResultElement ? parseInt(totalResultElement.textContent.trim(), 10) : null;
        
              return { diceResults, totalResult };
            }
            return null;
          `;

      return await driver.executeScript(script);
    };

    const getBankerInfo = async () => {
      const script = `
            const bankerInfoDiv = document.querySelector('.content--69b27.desktop--32202.banker--90e20');
            if (bankerInfoDiv) {
              const bankerAmount = bankerInfoDiv.querySelector('.info--4f685.banker--733e8 .amount--4976c') ? bankerInfoDiv.querySelector('.info--4f685.banker--733e8 .amount--4976c').textContent.trim() : null;
              const bankerPlayers = bankerInfoDiv.querySelector('.info--4f685.banker--733e8 .players--06980') ? bankerInfoDiv.querySelector('.info--4f685.banker--733e8 .players--06980').textContent.trim() : null;
              const bankerPercentage = bankerInfoDiv.querySelector('.svgPercentIndicator--e8df0 .value--d9c0b') ? bankerInfoDiv.querySelector('.svgPercentIndicator--e8df0 .value--d9c0b').textContent.trim() : null;
              const bankerCoefficient = bankerInfoDiv.querySelector('.coefficient--e278b') ? bankerInfoDiv.querySelector('.coefficient--e278b').textContent.trim() : null;
              const bankerName = bankerInfoDiv.querySelector('.name--74e95') ? bankerInfoDiv.querySelector('.name--74e95').textContent.trim() : 'BANKER';
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
    
    // Periodically check for the banker information and dice results
    setInterval(async () => {
      const currentTime = getCurrentTimeString();
      const bankerInfo = await getBankerInfo(); // Make sure you have this function defined to get bet stats for BANKER
      const bankerDiceResults = await getBankerDiceResults();
    
      if (bankerInfo?.bankerAmount) {
        console.log(`${currentTime} - Banker bet information:`, bankerInfo);
      }
    
      if (bankerDiceResults) {
        console.log(
          `${currentTime} - Banker dice results:`,
          bankerDiceResults.diceResults,
          "Total result:",
          bankerDiceResults.totalResult
        );
      }
    }, 1000);

    const checkWinningResult = async (driver) => {
      const script = `
        const playerWinningDiv = document.querySelector('.winning--2bea3.player--a0c1a');
        const bankerWinningDiv = document.querySelector('.winning--2bea3.banker--f4570');
        if (playerWinningDiv) {
          return 'player';
        } else if (bankerWinningDiv) {
          return 'banker';
        }
        return 'none';
      `;
    
      return await driver.executeScript(script);
    };
    
    // Usage within an interval to periodically check for the winning result
    setInterval(async () => {
      const winningResult = await checkWinningResult(driver);
      if (winningResult === 'player') {
        console.log("Player wins");
      } else if (winningResult === 'banker') {
        console.log("Banker wins");
      } 
    }, 100); 
  } catch (error) {
    console.error("Error :", error);
  } finally {
    // This block will not be reached since the loop is infinite
    // To stop the script and close the browser, you can press Ctrl+C in the terminal
  }
}
async function findElementWithRetries(
  driver,
  selector,
  delayMs = 5000,
  maxRetries = 5
) {
  for (let attempts = 0; attempts < maxRetries; attempts++) {
    try {
      const element = await driver.wait(
        until.elementLocated(By.css(selector)),
        delayMs
      );
      await driver.wait(until.elementIsVisible(element), delayMs); // Wait for the element to be visible
      const text = await element.getText();
      if (text) {
        // Check if the text is not empty
        return text;
      }
      throw new Error("Element found but text is empty"); // If text is empty, throw an error to retry
    } catch (error) {
      if (attempts === maxRetries - 1) {
        throw error; // Rethrow the error on the last attempt
      }
      console.log(
        `Waiting for element ${selector} and its text - attempt ${attempts + 1}`
      );
      await driver.sleep(delayMs); // Wait before retrying
    }
  }
}

monitorPercentages();
