const kb = require("./keyboard-btns");
module.exports = {
  home: [
    [kb.home.sell, kb.home.buy],
    [kb.home.all, kb.home.favs],
    [kb.home.find, kb.home.my],
  ],
  newUser: [[{ text: kb.newUser, request_contact: true }]],
  all: [[kb.all.buying], [kb.all.selling], [kb.back]],
  sell: [[kb.back]],
  buy: [[kb.back]],
  find: [[kb.back]],
  my: [[kb.back]],
  favs: [[kb.back]],
};
