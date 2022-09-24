import { MyGame } from "./game.js";

export const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  //   backgroundColor: "#4488aa",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: MyGame,
};

const main = new Phaser.Game(config);
