require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT;
const bot = new TelegramBot(token, { polling: true });
bot.getMe().then((botInfo) => {
  console.log('Bot username:', botInfo.username);
});
// bot.on("message", (msg) => {
//   console.log("Your chat ID:", msg.chat.id, msg);
//   // Stop the bot after capturing the chat ID
//   // sendMessage(message,adamya)

//   bot.stopPolling();
// });

chatId= -4134796554

let lastMessageTime = 0;
let lastSentMessage = "";

const sendMessage = async (message) => {
  const currentTime = Date.now();
  const trimmedMessage = message.trim();

  // Check if the message is empty or the same as the last sent message
  if (!trimmedMessage || trimmedMessage === 'Result' || trimmedMessage === lastSentMessage) {
    return false;
  }
  
  // Check if at least 1 second has passed since the last message was sent
  if (currentTime - lastMessageTime >= 1000) {
    try {
      await bot.sendMessage(chatId, message);
      console.log("Message sent!");
      lastMessageTime = currentTime; // Update last message time
      lastSentMessage = trimmedMessage; 
      return true // Update last sent message
    } catch (error) {
      console.error("Error sending message:", error);
    }
  } else {
    console.log("Message rate limit reached. Please wait before sending another message.");
  }
  return false;
};


module.exports = { sendMessage };