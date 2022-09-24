const config = {
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
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
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

var platforms;
var score = 0;
var maxScore = localStorage.getItem("maxScore") || 0;
var scoreText;
function create() {
  this.add.image(config.width * 0.5, config.height * 0.5, "bg");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "log2").setScale(2).refreshBody();

  platforms.create(350, 500, "log");
  platforms.create(600, 400, "log2");
  platforms.create(50, 250, "log2");
  platforms.create(750, 220, "log2");

  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.1);
  player.setCollideWorldBounds(1);
  player.body.setGravityY(600);

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

  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: "star",
    repeat: 1,
    setXY: { x: 50, y: 100, stepX: 100 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, 0, this);

  scoreText = this.add.text(16, 16, `Score: 0 | Highest Score: ${maxScore}`, {
    fontSize: "32px",
    fill: "#000",
  });
  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function collectStar(player, star) {
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

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x > 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(200, 200);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-280);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(280);

    player.anims.play("right", true);
  } else {
    if (player.body.velocity.x < 0)
      player.setVelocityX((player.body.velocity.x += 10));
    else if (player.body.velocity.x > 0)
      player.setVelocityX((player.body.velocity.x -= 10));

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    cursors.up.isDown = false;
    player.setVelocityY(-550);
  }
}
