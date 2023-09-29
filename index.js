require("dotenv").config();
const TelegramApi = require("node-telegram-bot-api");
const database = require("./database");
// const helpers = require("./helpers");
const bot = new TelegramApi(process.env.TOKEN, { polling: true });
const keyboard = require("./keyboard");
const keyboardBtns = require("./keyboard-btns");
const connectToDb = database.connectToDb;
const Post = require("./models/leftover");
const getPosts = async (chatId, query) => {
  try {
    await connectToDb();

    const posts = await Post.find(query);
    const html = posts
      .map((p, i) => {
        return `<b> ${i}</b> ${p.manufacturer} ${p.color} ${p.dimensions}`;
      })
      .join("\n");
    bot.sendMessage(chatId, html, { parse_mode: "HTML" });
  } catch (error) {
    return new Response(
      JSON.stringify("Failed top fetch all posts", { status: 500 })
    );
  }
};
// bot.setMyCommands([
//   { command: "/start", description: "Початок спілкування" },
//   { command: "/menu", description: "Головне меню" },
//   { command: "/list", description: "Список всіх залишків" },
//   { command: "/new", description: "Запропонувати залишок" },
//   { command: "/find", description: "Знайти залишок" },
// ]);
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  switch (msg.text) {
    case keyboardBtns.home.all:
      const posts = await getPosts(chatId, {});
      console.log(posts),
        bot.sendMessage(chatId, "Всі оголошення", {
          reply_markup: { keyboard: keyboard.all },
        });
      break;
    case keyboardBtns.home.favs:
      break;
    case keyboardBtns.home.find:
      break;
    case keyboardBtns.home.new:
      break;
    case keyboardBtns.home.my:
      break;
    case keyboardBtns.back:
      bot.sendMessage(chatId, "Меню", {
        reply_markup: { keyboard: keyboard.home },
      });
      break;
  }
});
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Виберіть команду для початку роботи`, {
    reply_markup: {
      keyboard: keyboard.home,
    },
  });
});
