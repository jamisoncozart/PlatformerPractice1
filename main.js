var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var score = 0;
var scoreText;
var map;

//Load everything before running the game
function preload() {
  // this.load.tilemapTiledJSON('map', './assets/map.json');
  // this.load.spritesheet('tiles', './assets/tiles.png', {frameWidth: 16, frameHeight: 16});
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
  );
}

//Create all game objects and build the world
function create() {
  //Create custom tilemap
  map = this.make.tilemap({key: 'map'});

  // var groundTiles = map.addTilesetImage('tiles');
  // groundLayer = map.createDynamicLayer('Tile Layer 1', groundTiles, 0, 0);
  // groundLayer.setCollisionByExclusion([-1]);
  // this.physics.world.bounds.width = groundLayer.width;
  // this.physics.world.bounds.height = groundLayer.height;

  //Add Background Image
  this.add.image(400,300, 'sky');
  
  //Creating platforms
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  //Creating Player
  player = this.physics.add.sprite(100,450, 'dude');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  //Player Animations
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
  });
  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
  });
  this.physics.add.collider(player,platforms);

  //Controller Inputs
  cursors = this.input.keyboard.createCursorKeys();

  //Stars
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  this.physics.add.collider(stars,platforms);

  //Allows player to collect Stars
  this.physics.add.overlap(player, stars, collectStar, null, this);

  //Score Text
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  //Bombs
  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  //Camera Settings
  this.cameras.main.setBounds(0,0,map.widthInPixels, map.heightInPixels);
  this.cameras.main.startFollow(player);
}

function update() {
  if (cursors.left.isDown){
    player.setVelocityX(-160);
    player.anims.play('left', true);
  }
  else if (cursors.right.isDown){
    player.setVelocityX(160);
    player.anims.play('right', true);
  }
  else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }
  if (cursors.up.isDown && player.body.touching.down){
    player.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);
  if(stars.countActive(true) === 0) {
    stars.children.iterate(function(child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb (player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn')
    gameOver = true;
}