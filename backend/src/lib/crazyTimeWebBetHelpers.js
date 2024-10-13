const {
  setAsync,
  getAsync,
  delAsync,
  redisClient,
  lrangeAsync,
  lpushAsync,
} = require("../config/redisConfig");
const { sendMessage } = require("./telegram");

// Helper function to place a bet
async function placeBet(number, rounds, roundNumber) {
  const betId = `bet:${Date.now()}`; // Unique ID for each bet
  const betData = {
    number,
    roundsLeft: rounds,
    outcomes: [],
    betTimestamp: Date.now(), // Add bet placement timestamp
    roundNumber, // Track the round this bet is for
  };
  await lpushAsync("bets", JSON.stringify(betData)); // Store bet in Redis list
  //   sendMessage(`📝 Bet tracked: ${betId} for round ${roundNumber}`,process.env.CRAZYTIME_RESULT);
}

async function placeMultipleBets(number, startingRound, totalRounds) {
  for (let i = 0; i < totalRounds; i++) {
    const currentRoundNumber = startingRound + i;
    await placeBet(number, totalRounds, currentRoundNumber); // Pass current round number
  }
  sendMessage(
    `${totalRounds} bets placed for rounds starting from ${startingRound}`,
    process.env.CRAZYTIME_RESULT
  );
}

// Function to update bets based on game results
// async function updateBetResults(currentRoundNumber) {
//     // Fetch last 3 game results from the Redis list
//     const results = await lrangeAsync("gameResults", 0, 2); // Get the last three elements (most recent)
//     const parsedResults = results.map((result) => JSON.parse(result));

//     // Fetch all bets
//     const betKeys = await lrangeAsync("bets", 0, -1); // Get all bets

//     let message = `🔄 Bet Results Update for Round ${currentRoundNumber}\n\n`; // Initialize message string
//   console.log(betKeys)
//     for (let i = 0; i < betKeys.length; i++) {
//       let betData = JSON.parse(betKeys[i]);
// console.log(betData.roundsLeft > 0 && betData.roundNumber === currentRoundNumber,betData,currentRoundNumber)
//       if (betData.roundsLeft > 0 && betData.roundNumber === currentRoundNumber) {
//         const latestResult = parsedResults[0]; // Use the latest result (or you can customize logic)

//         // Ensure the result timestamp matches the bet's placement time
//         if (latestResult.timestamp >= betData.betTimestamp) {
//           betData.roundsLeft--;
//           betData.outcomes.push(latestResult); // Update bet outcomes with the latest result

//           // Update the bet in the list
//           await redisClient.lset("bets", i, JSON.stringify(betData)); // Update bet at index i in the list
//           message += `🎰 Bet ${i} (round ${betData.roundNumber}):\n  - Number Bet: ${betData.number}\n  - Slot Value: ${latestResult?.slotValue}\n  - Multiplier: ${latestResult?.multiplier}x\n`;

//           // Check if this bet was correct or incorrect
//           if (latestResult.slotValue === betData.number.toString()) {
//             message += `  ✅ Bet Success! The bet was correct for round ${betData.roundNumber}.\n\n`;
//           } else {
//             message += `  ❌ Bet Miss! The bet was wrong for round ${betData.roundNumber}.\n\n`;
//           }
//         }
//       } else {
//         message += `🗑️ Bet ${i} (round ${betData.roundNumber}) has no rounds left or doesn't match the current round.\n\n`;
//       }
//     }

//     // Send the consolidated message
//     sendMessage(message, process.env.CRAZYTIME_RESULT);
//   }

async function updateBetResults(currentRoundNumber) {
  try {
    // Fetch last 3 game results from the Redis list
    const results = await lrangeAsync("gameResults", 0, 2); // Get the last three elements (most recent)

    if (!results || results.length === 0) {
      console.log("No game results available to process.");
      return; // Exit if no game results are found
    }

    const parsedResults = results.map((result) => JSON.parse(result));
    
    // Fetch all bets
    const betKeys = await lrangeAsync("bets", 0, -1); // Get all bets

    if (!betKeys || betKeys.length === 0) {
      console.log("No bets available to update.");
      return; // Exit if no bets are found
    }

    let message = `🔄 **Bet Results Update**\n\n`; // Initialize message string

    for (let i = 0; i < currentRoundNumber + 1; i++) {
      let betData = JSON.parse(betKeys[i]);

      // Iterate through the game results and check if any match the bet's round number
      const matchingResult = parsedResults.find(
        (result) => result.roundNumber === betData.roundNumber
      );
      
      if (betData.roundsLeft > 0 && matchingResult) {
        // Ensure the result timestamp matches the bet's placement time
        if (matchingResult.timestamp >= betData.betTimestamp) {
          betData.roundsLeft--;
          betData.outcomes.push(matchingResult); // Update bet outcomes with the matching result

          // Update the bet in the Redis list
          await redisClient.lset("bets", i, JSON.stringify(betData)); // Update bet at index i in the list

          message += `🎰 Bet ${i} (round ${betData.roundNumber}):\n  - Number Bet: ${betData.number}\n  - Slot Value: ${matchingResult.slotValue}\n  - Multiplier: ${matchingResult.multiplier}x\n`;

          // Check if this bet was correct or incorrect
          if (matchingResult.slotValue === betData.number.toString()) {
            message += `  ✅ Bet Success! The bet was correct for round ${betData.roundNumber}.\n\n`;
          } else {
            message += `  ❌ Bet Miss! The bet was wrong for round ${betData.roundNumber}.\n\n`;
          }
        }
      } else {
        message += `🗑️ Bet ${i} (round ${betData.roundNumber}) has no rounds left or no matching game result.\n\n`;
      }
    }

    // Send the consolidated message
    // sendMessage(message, process.env.CRAZYTIME_RESULT);
  } catch (error) {
    console.error(error);
  }
}

// Function to analyze all bets
async function analyzeBets(currentRoundNumber) {
  const betKeys = await lrangeAsync("bets", 0, -1);
  console.log(betKeys); // Get all bets
  for (const bet of betKeys) {
      let betData = JSON.parse(bet);
      console.log(betData,currentRoundNumber)
    if (betData?.outcomes[1]?.slotValue) {
      let outcomeMessages = betData.outcomes
        .map((outcome) => {
          return `🎲 Multiplier: ${outcome.multiplier}, 🎯 Main Value: ${outcome.mainValue}, 🎰 Slot Value: ${outcome.slotValue}`;
        })
        .join("\n");
      console.log(betData, "from analysis");
      const lastOutcome = betData.outcomes[betData.outcomes.length - 1]; // Most recent outcome

      let statusMessage;
      if (lastOutcome.slotValue === betData.number.toString()) {
        statusMessage = `✅ Bet Success! You bet on ${betData.number} and it hit the slot value ${lastOutcome.slotValue} with a multiplier of ${lastOutcome.multiplier}x.`;
      } else {
        statusMessage = `❌ Bet Miss! You bet on ${betData.number}, but the last result was slot value ${lastOutcome.slotValue} with a multiplier of ${lastOutcome.multiplier}x.`;
      }

      // Beautiful message combining prediction and actual outcomes
      const message = `
  🔍 Analysis for Bet:
  - 🎰 Bet Number: ${betData.number}
  - 📅 Rounds Left: ${betData.roundsLeft}
    
  Outcomes:
  ${outcomeMessages}
  
  ${statusMessage}
      `;

      sendMessage(message, process.env.CRAZYTIME_RESULT); // This is where you would send the message using a chat service
    }
  }
}

module.exports = {
  placeBet,
  updateBetResults,
  analyzeBets,
  placeMultipleBets,
};
