
var game = new Phaser.Game(360, 600, Phaser.AUTO, 'Arcade', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('breakout', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
    game.load.image('starfield', 'assets/misc/starfield.jpg');
	game.load.audio('padsound', 'assets/audio/padsound.mp3');
	game.load.audio('goversound', 'assets/audio/goversound.mp3');
	game.load.audio('colisionsound', 'assets/audio/colisionsound.ogg');
	game.load.audio('beep1', 'assets/audio/beep1.ogg');
	game.load.audio('ladrilsound', 'assets/audio/ladrilsound.ogg');
}

var ball;
var paddle;
var bricks;

var ballOnPaddle = true;

var lives = 10;
var score = 0;

var scoreText;
var livesText;
var introText;

var s;
var padsound;
var goversound;
var colisionsound;
var beep1;
var ladrilsound;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;
    s = game.add.tileSprite(0, 0, 360, 600, 'starfield');
    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;
    //beep1 = game.add.audio('beep1');
		
    var brick;

    for (var y = 0; y < 4; y++)
    
    {
        for (var x = 0; x < 7; x++)
        {
            brick = bricks.create(55 + (x * 36), 100 + (y * 52), 'breakout', 'brick_' + (y+1) + '_1.png');
            brick.body.bounce.set(1);
            brick.body.immovable = true;           
        }
        //aqui sonido ready
    }

    paddle = game.add.sprite(game.world.centerX, 500, 'breakout', 'paddle_big.png');
    paddle.anchor.setTo(0.10, 0.10);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(25, 550, 'Puntos: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(260, 550, 'Vidas: 10', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click iniciar -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);
    game.input.onDown.add(releaseBall, this);
    
	padsound = game.add.audio('padsound');
	goversound = game.add.audio('goversound');	
}

function update () {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    // s.tilePosition.x += (game.input.speed.x / 2);

    paddle.x = game.input.x;
        
    if (paddle.x < 24)
    {
        paddle.x = 24;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;        
    }

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;       
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);       
    }
}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;      
    }
}

function ballLost () {
		
    lives--;
    livesText.text = 'Vidas: ' + lives;

    if (lives === 0)
    {
        padsound.stop();
        gameOver();           
    }
    else
    {
        ballOnPaddle = true;
        ball.reset(paddle.body.x + 16, paddle.y - 16);       
        ball.animations.stop();
        padsound.play();
    }	
}

function gameOver () {
	
    goversound.play();
    ball.body.velocity.setTo(0, 0);
    introText.text = 'Juego terminado!';
    introText.visible = true;	
}

function ballHitBrick (_ball, _brick) {
ladrilsound = game.add.audio('ladrilsound');
    _brick.kill();
	ladrilsound.play(); 
    score += 10;
    scoreText.text = 'Puntos: ' + score;
    
    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        //  New level starts
        score += 1000;
        scoreText.text = 'Puntos: ' + score;
        introText.text = '- Next Level -';

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        ball.animations.stop();

        //  And bring the bricks back from the dead :)
        bricks.callAll('revive');
    }
}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;
	colisionsound = game.add.audio('colisionsound');
	colisionsound.play();
    if (_ball.x < _paddle.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);         
    }
    else if (_ball.x > _paddle.x)
    {
        //  Ball is on the right-hand side of the paddle       
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);        
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;            
    }
}
