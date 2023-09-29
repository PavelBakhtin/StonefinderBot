const kb = require("./keyboard-btns");
module.exports = {
  home: [
    [kb.home.all, kb.home.favs],
    [kb.home.new, kb.home.find],
    [kb.home.my],
  ],
  all: [[kb.all.buy], [kb.all.sell], [kb.back]],
  back: [kb.back],
};
