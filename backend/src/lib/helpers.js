function formatResultsWithEmojis(results) {
  return results.map(res => {
    return `🔄 Round Number: ${res.roundNumber}\n🔄 Multiplier: ${res.multiplier}\n🎰 Main Value: ${res.mainValue}\n🎲 Slot Value: ${res.slotValue}\n⏰ Time: ${new Date(res.timestamp).toLocaleTimeString()}`;
  }).join("\n\n");
}

module.exports = { formatResultsWithEmojis };
