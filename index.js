const TelegramApi = require("node-telegram-bot-api");
const token = "5848704098:AAHOWDBVgoJNsEYOFp5rxubXLJ72rbcyucY";

const bot = new TelegramApi(token, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.chat.first_name;
  bot.sendMessage(chatId, `Вітаємо у Stonefinder,  ${userName}`);
});
