import { config } from "./main.js";

let score = 0;
let maxScore = localStorage.getItem("maxScore") || 0;
let scoreText = "";
export class MyGame extends Phaser.Scene {
  constructor() {
    super();
    this.platforms;
  }

  preload() {
    this.load.spritesheet("dude", "./assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("bg", "./assets/img_bg.png");
    this.load.image("log", "assets/basic-log.png");
    this.load.image("log2", "assets/flat-log.png");
    this.load.image("star", "./assets/char-1.png");
    this.load.image("bomb", "./assets/branch-1.png");
  }

  create() {
    this.add.image(config.width * 0.5, config.height * 0.5, "bg");

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "log2").setScale(2).refreshBody();

    this.platforms.create(350, 500, "log");
    this.platforms.create(600, 400, "log2");
    this.platforms.create(50, 250, "log2");
    this.platforms.create(750, 220, "log2");

    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(1);
    this.player.body.setGravityY(600);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 1,
      setXY: { x: 50, y: 100, stepX: 100 },
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, collectStar, 0, this);

    scoreText = this.add.text(16, 16, `Score: 0 | Highest Score: ${maxScore}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(this.player, this.bombs, hitBomb, null, this);
  }

  update() {
    {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-280);

        this.player.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(280);

        this.player.anims.play("right", true);
      } else {
        if (this.player.body.velocity.x < 0)
          this.player.setVelocityX((this.player.body.velocity.x += 10));
        else if (this.player.body.velocity.x > 0)
          this.player.setVelocityX((this.player.body.velocity.x -= 10));

        this.player.anims.play("turn");
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.cursors.up.isDown = false;
        this.player.setVelocityY(-550);
      }
    }
  }
}

function collectStar(player, star = game) {
  // param 1 disable pyshic and engine
  // param 2 disable model
  star.disableBody(true, true);
  // scoring
  score += 10;
  if (score >= maxScore) {
    localStorage.setItem("maxScore", score);
    maxScore = score;
  }
  scoreText.setText(`Score: ${score} | Highest Score: ${maxScore}`);

  if (this.stars.countActive(true) === 0) {
    this.stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x > 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    for (let i = 0; i < 10; i++) {
      var bomb = this.bombs.create(x * i, 16 * i, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(200, 200);
    }
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint("0xff0000");

  player.anims.play("turn");

  this.gameOver = true;
  setTimeout(() => {
    window.location.reload();
  }, 250);
}
