window.addEventListener("load", function () {

    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const Game = {
        score: 0,
        highscore: 0,
        gravity: 1,
        velocity: 2,
        difficulty: 1,
        friction: 0.97,
        height: 0,
        width: 0,
        obstacles: [],
        initialSpawnTimer: 10,
        spawnTimer: 0,
        startButton: document.getElementById('start'),
        scoreText: document.getElementById('score'),
        highscoreText: document.getElementById('highscore'),
        endscreen: document.getElementById('endscreen'),
        collideObject: function (object) {
            if (object.x < 0) {
                object.x = 0;
                object.bounce();
            }
            else if (object.x + object.width > this.width) {
                object.x = this.width - object.width;
                object.bounce();
            }
            if (object.y < 0) {
                object.y = -object.height;
                this.end();
            }
            else if (object.y + object.height > this.height) {
                object.y = this.height + object.height;
                this.end();
            }
        },
        resize: function () {
            this.width = window.innerWidth <= 500 ? window.innerWidth * .9 : 500;
            this.height = window.innerHeight * 0.7;
            canvas.width = this.width;
            canvas.height = this.height;
        },
        end: function () {
            window.cancelAnimationFrame(animation);
            console.log('lose');
            localStorage.setItem('highscore', this.highscore);
            Game.endscreen.style.display = 'block';
        },
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },
        spawnObstacle: function () {
            let maxWidth = this.width - (player.width * 2) / this.difficulty;
            let width = this.getRandomInt(player.width * 1.2, maxWidth)
            let x = this.getRandomInt(0, (this.width - width))
            const obstacle = new Obstacle(width, 20, x, this.height + 20);
            this.obstacles.push(obstacle);
        }
    };

    const Controller = {
        keys: [],
        keyHandler: function (code, type) {
            this.keys[code] = type === 'keydown';
        }
    };

    class Animatable {
        constructor(x, y, width, height, image) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.img = new Image();
            this.img.src = `./img/${image}`;
        }
        draw() {
            ctx.beginPath();
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            ctx.closePath();
        }
    }

    class Player extends Animatable {
        constructor(x, y, width, height, image) {
            super(x, y, width, height, image);
        }
        x_velocity = 0;
        y_velocity = 0;
        originalHeight = this.height;
        originalWidth = this.width;
        grounded = false;
        move(left = false) {
            let velocity = left ? -0.7 : 0.7;
            this.x_velocity += velocity;
        }
        update() {
            this.height = this.originalHeight;
            this.width = this.originalWidth;
            this.x += this.x_velocity;
            this.y += this.y_velocity;
        }
        bounce() {
            this.width *= .8;
            this.x_velocity = -this.x_velocity;
        }
        handleCollision(obstacle) {
            if (this.y === obstacle.y - this.height ||
                (this.y_velocity > 0 && obstacle.y - this.height - this.y <= this.y_velocity && obstacle.y - this.height - this.y > 0)) {
                if (this.x >= obstacle.x + obstacle.width || this.x + this.width <= obstacle.x) {
                    this.grounded = false;
                } else {
                    this.y = obstacle.y - this.height;
                    this.y_velocity = obstacle.y_velocity;
                    this.grounded = true;
                }
            }
        }
    }

    class Obstacle {
        constructor(width, height, x, y) {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
        }
        y_velocity = 0;
        update() {
            this.y_velocity = -Game.velocity;
            this.y += this.y_velocity;
        }
        draw() {
            ctx.beginPath();
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.closePath();
        }
    }

    const player = new Player(100, 250, 50, 50, 'lmao.png');

    let animation;


    function Start() {
        Game.resize();
        Game.startButton.style.display = 'none';
        animation = requestAnimationFrame(Update);
    }


    function Update() {
        animation = requestAnimationFrame(Update);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Game.score++;
        this.difficulty *= 1.001;
        Game.spawnTimer -= .5;
        if (Game.spawnTimer <= 0) {
            Game.spawnObstacle();
            if (Game.spawnTimer < 60 / Game.velocity) {
                Game.spawnTimer = 60 / Game.velocity;
            }
        }
        Game.obstacles.forEach((o, i) => {
            o.y_velocity -= Game.velocity;
            o.draw();
            if (o.y + o.height < 0) {
                Game.obstacles.splice(i, 1);
            }
            o.update();
            player.handleCollision(o);
        })

        Game.collideObject(player);

        player.draw();
        player.update();
        if (Controller.keys['ArrowLeft'] || Controller.keys['KeyA']) {
            player.move(true);
        }
        if (Controller.keys['ArrowRight'] || Controller.keys['KeyD']) {
            player.move();
        }


        player.x_velocity *= Game.friction;
        if (!player.grounded) player.y_velocity += Game.gravity;

        if (Game.score > Game.highscore) {
            Game.highscore = Game.score;
        }
        Game.scoreText.innerHTML = Game.score;
        Game.highscoreText.innerHTML = Game.highscore;
    }



    const keyHandler = (event) => Controller.keyHandler(event.code, event.type);
    Game.resize();

    if (localStorage.getItem('highscore')) {
        Game.highscore = localStorage.getItem('highscore');
    }

    Game.scoreText.innerHTML = Game.score;
    Game.highscoreText.innerHTML = Game.highscore;

    window.addEventListener('resize', Game.resize);
    window.addEventListener('keydown', keyHandler);
    window.addEventListener('keyup', keyHandler);

    Game.startButton.addEventListener('click', Start);
});