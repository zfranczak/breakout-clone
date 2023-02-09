let player, ball, redBricks, yellowBricks, blueBricks, cursors;
let openingText, gameOverText, playerWonText;

// This object contains all the Phaser configurations to load game
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  heigth: 640,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false,
    },
  },
};

// Create the game instance
const game = new Phaser.Game(config);
let gameStarted = false;

function preload() {
  this.load.spritesheet('paddleglow', 'assets/paddleSpriteSheet.png', {
    frameWidth: 80,
    frameHeight: 16,
  });

  this.load.image('ball', 'assets/ball.png');
  this.load.image('brick1', 'assets/brick1.png');
  this.load.image('brick2', 'assets/brick2.png');
  this.load.image('brick3', 'assets/brick3.png');
}

function create() {
  //opening text to start game
  openingText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'Press SPACE to Start',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff',
    }
  );
  //sets location of paddle
  openingText.setOrigin(0.5);

  player = this.physics.add.sprite(
    400, // x position
    600, // y position
    'paddleglow', // key of image for the sprite
    1
  );
  //creates glowing animation
  let myframes = this.anims.generateFrameNumbers('paddleglow', {
    start: 0,
    end: 2,
    first: 2,
  });

  this.anims.create({
    key: 'glowinganim',
    frames: myframes,
    frameRate: 3,
    repeat: -1,
    yoyo: true,
  });

  player.anims.play('glowinganim');

  //sets location of ball
  ball = this.physics.add.sprite(
    400, // x position
    565, // y position
    'ball' // key of image for the sprite
  );

  //Add red bricks
  redBricks = this.physics.add.group({
    key: 'brick1',
    repeat: 9,
    immovable: true,
    setXY: {
      x: 80,
      y: 140,
      stepX: 70,
    },
  });

  this.tweens.add({
    targets: redBricks.getChildren(),
    duration: 10000,
    repeat: -1,
    yoyo: true,
    angle: '+=10',
    alpha: '-=0.5',
    x: '+=30',
    y: '+=160',
  });

  // Add yellow bricks
  yellowBricks = this.physics.add.group({
    key: 'brick2',
    repeat: 9,
    immovable: true,
    setXY: {
      x: 80,
      y: 90,
      stepX: 70,
    },
  });

  this.tweens.add({
    targets: yellowBricks.getChildren(),
    duration: 20000,
    repeat: -1,
    yoyo: true,
    angle: '-=10',
    alpha: '+=0.5',
    x: '-=50',
    y: '+=120',
  });

  // Add blue bricks
  blueBricks = this.physics.add.group({
    key: 'brick3',
    repeat: 9,
    immovable: true,
    setXY: {
      x: 80,
      y: 40,
      stepX: 70,
    },
  });

  this.tweens.add({
    targets: blueBricks.getChildren(),
    duration: 10000,
    repeat: -1,
    yoyo: true,
    angle: '+=10',
    alpha: '-=0.5',
    x: '+=30',
    y: '+=80',
  });

  //controls
  cursors = this.input.keyboard.createCursorKeys();
  //colliders for the ball and paddle
  player.setCollideWorldBounds(true);
  ball.setCollideWorldBounds(true);
  //sets ball bounce
  ball.setBounce(1, 1);
  this.physics.world.checkCollision.down = false;
  //brick collision
  this.physics.add.collider(ball, redBricks, hitBrick, null, this);
  this.physics.add.collider(ball, yellowBricks, hitBrick, null, this);
  this.physics.add.collider(ball, blueBricks, hitBrick, null, this);
  //sets paddle to be an immovable object
  player.setImmovable(true);
  //sets immovable object between ball and paddle
  this.physics.add.collider(ball, player, hitPlayer, null, this);

  // Create game over text
  gameOverText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'You have Lost',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff',
    }
  );

  gameOverText.setOrigin(0.5);

  // Make it invisible until the player loses
  gameOverText.setVisible(false);

  // Create the game won text
  playerWonText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'You won!  To the Moon!',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff',
    }
  );

  playerWonText.setOrigin(0.5);

  // Make it invisible until the player wins
  playerWonText.setVisible(false);
}

function update() {
  // Check if the ball left the scene i.e. game over
  if (isGameOver(this.physics.world)) {
    gameOverText.setVisible(true);
  } else if (isWon(this.physics.world)) {
    playerWonText.setVisible(true);
  } else {
    //player stays still if no key is pressed
    player.body.setVelocityX(0);

    if (cursors.space.isDown) {
      gameStarted = true;
      ball.setVelocityY(-200);
      openingText.setVisible(false);
    }
    if (cursors.left.isDown) {
      player.body.setVelocityX(-350);
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(350);
    }
    if (!gameStarted) {
      ball.setX(player.x);

      if (cursors.space.isDown) {
        gameStarted = true;
        ball.setVelocityY(-200);
      }
    }
  }
}

//restarts game when ball drops below paddle
function isGameOver(world) {
  return ball.body.y > world.bounds.height;
}

//player wins if all bricks are gone
function isWon() {
  return (
    redBricks.countActive() +
      yellowBricks.countActive() +
      blueBricks.countActive() ===
    0
  );
}

function hitBrick(ball, brick) {
  brick.disableBody(true, true);

  if (ball.body.velocity.x === 0) {
    randNum = Math.random();
    if (randNum >= 0.5) {
      ball.body.setVelocityX(150);
    } else {
      ball.body.setVelocityX(-150);
    }
  }
}
//defines hitPlayer
function hitPlayer(ball, player) {
  // Increase the velocity of the ball after it bounces
  ball.setVelocityY(ball.body.velocity.y - 5);

  let newXVelocity = Math.abs(ball.body.velocity.x) + 5;
  // If the ball is to the left of the player, ensure the X-velocity is negative
  if (ball.x < player.x) {
    ball.setVelocityX(-newXVelocity);
  } else {
    ball.setVelocityX(newXVelocity);
  }
}
