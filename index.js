require("dotenv").config();
const TelegramApi = require("node-telegram-bot-api");
const database = require("./database");
// const helpers = require("./helpers");
const bot = new TelegramApi(process.env.TOKEN, { polling: true });
const keyboard = require("./keyboard");
const keyboardBtns = require("./keyboard-btns");
const connectToDb = database.connectToDb;
const Post = require("./models/post");
const User = require("./models/user");
const date = require("date-and-time");
const getPosts = async (chatId, query) => {
  try {
    await connectToDb();

    const posts = await Post.find(query);

    const html = posts
      .map((p, i) => {
        const whatType = (p) => {
          if (p.type === "Sell") return "Пропоную";
          else return "Шукаю";
        };

        const type = whatType(p);
        return `${type} ${p.info}\nДата: ${p.date}\nПосилання---> /I${p._id}\n ------------------------------`;
      })
      .join("\n");
    if (html.length === 0)
      return bot.sendMessage(chatId, "По Вашому запиту нічого не знайдено", {
        parse_mode: "HTML",
      });
    bot.sendMessage(chatId, html, {
      parse_mode: "HTML",
    });
    return posts;
  } catch (error) {
    return new Response(
      JSON.stringify("Failed to fetch all posts", { status: 500 })
    );
  }
};
const getMyPosts = async (chatId, query) => {
  try {
    await connectToDb();
    const posts = await Post.find(query);

    posts.map((p, i) => {
      const whatType = (p) => {
        if (p.type === "Sell") return "Пропоную";
        else return "Шукаю";
      };

      const type = whatType(p);
      const html = `${type} ${p.info}`;
      bot.sendMessage(chatId, html, {
        reply_markup: {
          parse_mode: "HTML",
          inline_keyboard: [
            [
              {
                text: "Видалити",
                callback_data: JSON.stringify({
                  type: ACTION_TYPE.DELETE_POST,
                  postId: p._id,
                }),
              },
            ],
          ],
        },
      });
    });

    if (html.length === 0)
      return bot.sendMessage(chatId, "По Вашому запиту нічого не знайдено", {
        parse_mode: "HTML",
      });
  } catch (error) {
    return new Response(
      JSON.stringify("Failed to fetch all posts", { status: 500 })
    );
  }
};
const getFavPosts = async (chatId, query) => {
  try {
    await connectToDb();

    const user = await User.findOne({ telegramId: query.from.id });

    if (user) {
      const favs = await Post.find({ _id: { $in: user.favs } });
      if (favs.length > 0) {
        const html = favs
          .map((fav) => {
            const whatType = (fav) => {
              if (fav.type === "Sell") return "Пропоную";
              else return "Шукаю";
            };

            const type = whatType(fav);
            return `${type} ${fav.info}\nДата: ${fav.date}\nПосилання---> /I${fav._id}\n ------------------------------`;
          })
          .join("\n");

        bot.sendMessage(chatId, html, {
          reply_markup: {
            parse_mode: "HTML",
          },
        });
      }
      if (favs.length === 0)
        return bot.sendMessage(chatId, "У Вас поки немає обраних пропозицій", {
          parse_mode: "HTML",
        });
    } else {
      bot.sendMessage(chatId, "У Вас поки немає обраних пропозицій", {});
    }
  } catch (error) {}
};
const addPost = async (msg, type) => {
  await connectToDb();

  try {
    const now = new Date();
    await connectToDb();
    const post = {
      authorId: msg.from.id,
      name: msg.chat.username,
      info: msg.text,
      type: type,
      date: date.format(now, "HH:mm:ss DD/MM/YYYY"),
    };
    await new Post(post).save();
    console.log("Success");
  } catch (error) {
    console.error(error);
  }
};
const deletePost = async (id) => {
  try {
    await connectToDb();
    await Post.findByIdAndDelete(id);
    console.log("Success");
  } catch (error) {
    console.error(error);
  }
};
bot.setMyCommands([{ command: "/start", description: "Початок спілкування" }]);
bot.onText(/\/start/, async (msg) => {
  connectToDb();
  const user = await User.findOne({ telegramId: msg.from.id });
  if (user) {
    console.log(user);
  }
  const chatId = msg.chat.id;
  if (!user) {
    bot.sendMessage(chatId, `Для продовження роботи відправте Ваш номер`, {
      reply_markup: {
        keyboard: keyboard.newUser,
      },
      request_contact: true,
    });
    bot.once("message", async (msg) => {
      console.log(msg)
      // if (msg.text !== "Назад" && msg.text[0] != "/") {
      //   bot.sendMessage(chatId, "Номер отримано", {
      //     reply_markup: { keyboard: keyboard.home },
      //   });
      // }
      return;
    });

    // const user = {
    //   telegramId: msg.from.id,

    //   favs: [],
    // };
    // await new User(user).save();
  }
});
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const user = await bot.getChatMember(chatId, msg.from.id);
  const userName = user.user.username;
  switch (msg.text) {
    case keyboardBtns.home.all:
      bot.sendMessage(chatId, "Всі оголошення", {
        reply_markup: {
          parse_mode: "HTML",
          keyboard: keyboard.all,
        },
      });
      await getPosts(chatId, {});

      break;
    case keyboardBtns.home.find:
      bot.sendMessage(chatId, "Введіть назву або артикул", {
        reply_markup: {
          parse_mode: "HTML",
          keyboard: keyboard.find,
        },
      });
      bot.once("message", async (msg) => {
        if (msg.text !== "Назад" && msg.text[0] != "/") {
          bot.sendMessage(chatId, "Ось що я знайшов", {});

          await getPosts(chatId, {
            info: { $regex: msg.text, $options: "i" },
          });
          bot.sendMessage(chatId, "Меню", {
            reply_markup: {
              parse_mode: "HTML",
              keyboard: keyboard.home,
            },
          });
        }
      });
      break;
    case keyboardBtns.all.buying:
      bot.sendMessage(chatId, "Оголошення про продаж", {
        reply_markup: {
          parse_mode: "HTML",
          keyboard: keyboard.all,
        },
      });
      await getPosts(chatId, { type: "Buy" });
      break;
    case keyboardBtns.all.selling:
      bot.sendMessage(chatId, "Оголошення про пошук:", {
        reply_markup: {
          parse_mode: "HTML",
          keyboard: keyboard.all,
        },
      });
      await getPosts(chatId, { type: "Sell" });
      break;
    case keyboardBtns.home.favs:
      await getFavPosts(chatId, msg);
      bot.sendMessage(chatId, "Обрані оголошення:", {
        reply_markup: {
          parse_mode: "HTML",
          keyboard: keyboard.favs,
        },
      });
      break;
    case keyboardBtns.home.buy:
      if (!userName) {
        console.log("no username");
      }
      bot.sendMessage(
        chatId,
        "Введіть власне оголошення про пошук та натисніть відправити!",
        {
          reply_markup: { keyboard: keyboard.buy },
        }
      );
      bot.once("message", async (msg) => {
        if (msg.text !== "Назад" && msg.text[0] != "/") {
          await addPost(msg, "Buy");
          bot.sendMessage(chatId, "Оголошення успішно створене!", {
            reply_markup: { keyboard: keyboard.home },
          });
        }
        return;
      });

      break;
    case keyboardBtns.home.sell:
      bot.sendMessage(
        chatId,
        "Введіть власне оголошення про продаж та натисніть відправити!",
        {
          reply_markup: { keyboard: keyboard.sell },
        }
      );
      bot.once("message", async (msg) => {
        if (msg.text !== "Назад" && msg.text[0] != "/") {
          await addPost(msg, "Sell");

          bot.sendMessage(chatId, "Оголошення успішно створене!", {
            reply_markup: { keyboard: keyboard.home },
          });
        }
      });

      break;
    case keyboardBtns.home.my:
      await getMyPosts(chatId, { name: msg.from.username });
      bot.sendMessage(chatId, "Мої оголошення", {
        reply_markup: {
          parse_mode: "HTML",
          keyboard: keyboard.my,
        },
      });
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
bot.onText(/\/I(.+)/, async (msg, [source, match]) => {
  const id = source.substr(2, source.length);
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const post = await Post.findOne({ _id: id });
    const html = `Автор:  ${post.name} \n Інфо:  ${post.info} \n Дата:  ${post.date} \n`;
    const user = await User.findOne({ telegramId: userId });

    let isFav = false;
    if (user) {
      isFav = user.favs.includes(id);
    }
    const textMessage = isFav ? "Видалити з обраного" : "Додати в обране";

    bot.sendMessage(chatId, html, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Зв'язатися",
              url: `t.me/${post.name}`,
            },
            {
              text: "Всі оголошення автора",
              callback_data: JSON.stringify({
                type: ACTION_TYPE.GET_POSTS_BY_USER,
                authorId: post.authorId,
              }),
            },
            {
              text: textMessage,
              callback_data: JSON.stringify({
                type: ACTION_TYPE.TOGGLE_FAV_POST,
                postId: id,
                isFav: isFav,
              }),
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.log(error);
  }
});
const ACTION_TYPE = {
  TOGGLE_FAV_POST: "tfp",
  CONTACT_USER: "cu",
  GET_POSTS_BY_USER: "get",
  DELETE_POST: "del",
};
const toggleFavPost = async (userId, queryId, data) => {
  try {
    connectToDb();

    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      const user = {
        telegramId: userId,
        favs: [data.postId],
      };
      await new User(user).save();
    }

    if (user) {
      if (data.isFav) {
        user.favs = user.favs.filter((id) => id !== data.postId);

        await user.save();
      } else {
        user.favs.push(data.postId);
        await user.save();
      }
    }

    const answerText = data.isFav ? "Видалено" : "Додано";
    bot.answerCallbackQuery(queryId, { text: answerText });
  } catch (error) {
    console.error(error);
  }
};
bot.on("callback_query", (query) => {
  let data;
  try {
    data = JSON.parse(query.data);
  } catch (error) {
    throw new Error("Data is not an Object");
  }

  const userId = query.from.id;
  const postId = data.postId;
  const chatId = query.message.chat.id;
  const { type } = data;
  switch (type) {
    case ACTION_TYPE.TOGGLE_FAV_POST:
      toggleFavPost(userId, query.id, data);
      setTimeout(() => {
        bot.sendMessage(chatId, "Обрані оголошення:", {
          reply_markup: {
            parse_mode: "HTML",
            keyboard: keyboard.favs,
          },
        });
        getFavPosts(chatId, query);
      }, 1000);
      break;
    case ACTION_TYPE.GET_POSTS_BY_USER:
      bot.sendMessage(chatId, "Всі оголошення автора", {
        reply_markup: { keyboard: keyboard.back },
      });
      getPosts(chatId, { authorId: data.authorId });

      break;
    case ACTION_TYPE.DELETE_POST:
      const success = deletePost(postId);
      if (success)
        bot.sendMessage(chatId, "Оголошеня успішно видалене!", {
          reply_markup: { keyboard: keyboard.my },
        });
      setTimeout(() => {
        bot.sendMessage(chatId, "Мої оголошення", {
          reply_markup: { keyboard: keyboard.my },
        });
        getMyPosts(chatId, { name: query.message.chat.username });
      }, 1000);

      break;
  }
});
