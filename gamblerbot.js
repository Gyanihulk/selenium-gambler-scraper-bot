require("dotenv").config();
const { sendMessage } = require("./lib/telegram");
const { Builder, By, until } = require("selenium-webdriver");
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
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
    await driver.findElement(usernameField).sendKeys(email);
    await driver.findElement(passwordField).sendKeys(password);

    // Submit the login form
    const loginSubmitButton = By.css("button.red.submit");
    await driver.wait(until.elementLocated(loginSubmitButton), 10000);
    await driver.findElement(loginSubmitButton).click();
    console.log("Attempting Login");
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

    let lastWinner = null;

    const checkWinningResult = async (driver) => {
      const script = `
    const playerWinningDiv = document.querySelector('.winning--2bea3.player--a0c1a');
    const bankerWinningDiv = document.querySelector('.winning--2bea3.banker--f4570');
    const tieDiv = document.querySelector('.winning--2bea3.tie--1ae4b');
    let result = 'none';
    if (playerWinningDiv) {
      result = 'player';
    } else if (bankerWinningDiv) {
      result = 'banker';
    }else if (tieDiv){
      result ='tie';
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
        const inactivityContainer = document.querySelector('[data-role="inactivity-message-container"]');
        if (inactivityContainer) {
          const playButton = inactivityContainer.querySelector('[data-role="play-button"]');
          if (playButton) {
            playButton.click(); // Click the play button to resume the game
            return true; // Return true to indicate that the button was clicked
          }
        }
        return false; // Return false if the inactivity container or play button was not found
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
    let lastBankerPercentage = 0;
    let lastPlayerPercentage = 0;
    let lowBetHighPopulationCounter=0;
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
          console.log('Play button clicked to resume the game from inactivity.');
         
        }

        if (!endMessageSent && winningResult) {
          message = "";
    

          if (winningResult === "player") {
            console.log("Player wins", playerDiceResults);
            currentGameResult =
              lastPlayerBetAmount > lastBankerBetAmount ? "High" : "Low";

            if (lastGameResult == currentGameResult) {
              counter++;
            } else {
              counter = 1;
            }
            if (
              lastPlayerPopulation > lastBankerPopulation &&
              lastPlayerBetAmount < lastBankerBetAmount
            ) {
              lowBetHighPopulationCounter++;
              message += `${currentGameResult} Player ${counter} - Low Bet by High Pop`;
            } else {
              message += `${currentGameResult} Player ${counter}`;
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
              message+=lastGameResult + " " + counter
              message+=' Tie '
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
                  message += bankerDiceResults.totalResult ;
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

          if (elapsedSeconds >= 10) {
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
  } catch (error) {
    console.error("Error :", error);
  } finally {
    // This block will not be reached since the loop is infinite
    // To stop the script and close the browser, you can press Ctrl+C in the terminal
  }
}

monitorPercentages();
