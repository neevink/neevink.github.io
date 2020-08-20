//WEB

var user = {
	id:0,
	totalScore: 0,
	highScore: 0,
}

vkBridge.send("VKWebAppInit", {});

vkBridge
	.send('VKWebAppGetUserInfo', {})
	.then(data => {
		user.id = data.id;
	})
	.catch(error => {
		console.log("Something went wrong");
	});

function loadSaves(){
	function checkIsNumber(x) {
	  	if (isNaN(parseInt(x))){
	  		return 0;
	  	}
	  	else{
	  		return parseInt(x);
	  	}
	}

	vkBridge.send("VKWebAppStorageGet", {"keys": ["totalScore", "highScore"]})
		.then(data => {
			console.log(data);

  			user.totalScore = checkIsNumber(data.keys[0].value);
  			user.highScore = checkIsNumber(data.keys[1].value);

			total = user.totalScore;
			highScore = user.highScore;
		})
		.catch(error => {
			console.log("Something went wrong");
		});
}

function saveSaves(){
	vkBridge.send("VKWebAppStorageSet", {"key": "totalScore", "value": user.totalScore.toString()})
		.then(data => {
			console.log("Success!");
		})
		.catch(error => {
			console.log("Something went wrong");
		});

	vkBridge.send("VKWebAppStorageSet", {"key": "highScore", "value": user.highScore.toString()})
		.then(data => {
			console.log("Success!");
		})
		.catch(error => {
			console.log("Something went wrong");
		});
}

loadSaves();
console.log(user);

function shareRecord(){
	vkBridge.send("VKWebAppShowWallPostBox", {"message": "У меня новый рекорд в игре Космическая битва! Мой новый рекорд: " + user.highScore + "! Присоединись: https://vk.com/app7571672_212141958"} );
}

//GAME

const cnvs = document.getElementById("main-canvas"),
	ctx     = cnvs.getContext('2d');
ctx.font = "35px Roboto";

const shopButton = document.getElementById("shop-menu");
const replayButton = document.getElementById("replay-menu");
const backButton = document.getElementById("back-menu");

const spaceshipImg = new Image();
spaceshipImg.src = "graphics/spaceship.png";

const meteoriteImg = new Image();
meteoriteImg.src = "graphics/meteorite.png";

const coinImg = new Image();
coinImg.src = "graphics/coin.png";

var spaceship = {
	enable: true,
	x:cnvs.width/2.0,
	y:cnvs.height/2.0,
	w:72,
	h:72,
	directionRight : true,
	speed:3,
	img : spaceshipImg,
	draw: () => {
		ctx.drawImage(spaceship.img, spaceship.x - spaceship.w/2, spaceship.y - spaceship.h/2, spaceship.w, spaceship.h);
	}
};

var background = {
	draw: () => {
		ctx.fillStyle = "#2C3052";
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);

		ctx.fillStyle = "#334769";
		ctx.fillRect(cnvs.width * 0.25, spaceship.y - 20, cnvs.width * 0.5, 40);

		ctx.beginPath();
		ctx.arc(cnvs.width * 0.25, spaceship.y, 20, 0, 2 * Math.PI);
		ctx.arc(cnvs.width * 0.75, spaceship.y, 20, 0, 2 * Math.PI);
		ctx.fill();
	}
}

var pauseMenu = {
	draw: () =>{
		ctx.fillStyle = "#2C3052";
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);

		ctx.textAlign = "left";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("total: " + total, 10, 50);
		
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.fillText("score: " + score, cnvs.width/2, cnvs.height/2);

		if(isRecord){
			ctx.fillText("new record!", cnvs.width/2, cnvs.height/2 - 50);
		}
		else{
			ctx.fillText("high score: " + highScore, cnvs.width/2, cnvs.height/2 - 50);
		}
	}
}

var shopMenu = {
	draw: () => {
		ctx.fillStyle = "#2C3052";
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);

		ctx.textAlign = "left";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("total: " + total, 10, 50);
	}
}

function Meteorite() {
	this.enable = false;
	this.x = getRandomInt(cnvs.width);
	this.y = -50;
	this.w = 50;
	this.h = 50;
	this.direction = { x:0, y:0 };
	this.angle = getRandomInt(360);
	this.speed = 5;
	this.rotationSpeed = 3-getRandomInt(6);
	this.receivedCoin = false;
	this.isCoin = false;
	this.img = meteoriteImg;
	this.draw = function(){
		ctx.translate(this.x, this.y);
		ctx.rotate(eulerToRadians(this.angle));
		ctx.drawImage(this.img, -this.w/2, -this.h/2, this.w, this.h);
		ctx.rotate(-eulerToRadians(this.angle));
		ctx.translate(-this.x, -this.y);
	};

	let target = {
		x: cnvs.width * 0.3 + getRandomInt(cnvs.width * 0.4) - this.x,
		y: spaceship.y + spaceship.h/2 - this.y
	};
	let magn = magnitude(target.x, target.y);
	this.direction.x = target.x / magn;
	this.direction.y = target.y / magn;
};

var firstPauseFrame = false;

//Frame
function update(){
	if(pause){
		if(firstPauseFrame){
			user.totalScore = total;
			user.highScore = highScore;


			firstPauseFrame = false;
			saveSaves();
		}

		if(!shop){
			shopButton.style.visibility = 'visible';
			replayButton.style.visibility = 'visible';

			backButton.style.visibility = 'hidden';
		}
		else{
			shopButton.style.visibility = 'hidden';
			replayButton.style.visibility = 'hidden';

			backButton.style.visibility = 'visible';
		}
	}
	else{
		shopButton.style.visibility = 'hidden';
		replayButton.style.visibility = 'hidden';

		backButton.style.visibility = 'hidden';
	}

	//spaceship
	if(!pause && spaceship.directionRight){
		if(spaceship.x < cnvs.width * 0.75){
			spaceship.x+=spaceship.speed;
		}
		else{
			cahangeDirection();
		}
	}
	else{
		if(!pause && spaceship.x > cnvs.width * 0.25){
			spaceship.x-=spaceship.speed;
		}
		else{
			cahangeDirection();
		}
	}
	if(!pause){
		for(i = 0; i < meteorites.length; i++){
			if(meteorites[i].enable){
				meteorites[i].angle+=meteorites[i].rotationSpeed;
				meteorites[i].x += meteorites[i].direction.x * meteorites[i].speed;
				meteorites[i].y += meteorites[i].direction.y * meteorites[i].speed;
	
				if(spaceship.enable && magnitude(spaceship.x - meteorites[i].x, spaceship.y - meteorites[i].y) < 35){
					meteorites[i].enable = false;
					if(meteorites[i].isCoin){
						score+=10;
					}
					else{
						spaceship.enable = false;
						meteorites[i].enable = false;
						
						firstPauseFrame = true;
						pause = true;
						if(score > highScore){
							highScore = score;
							isRecord = true;
						}
						else{
							isRecord = false;
						}
	
						total += score;
					}
				}
	
				if(!pause && !meteorites[i].receivedCoin && meteorites[i].y > spaceship.y + 50){
					meteorites[i].receivedCoin = true;
					score++;
				}
	
				if(!pause && meteorites[i].y > cnvs.height + 50){
					meteorites[i].enable = false;
				}
			}
		}
	}
	updateScreen();
}

function updateScreen(){
	background.draw();

	for(i = 0; i < meteorites.length; i++){
		if(meteorites[i].enable){
			meteorites[i].draw();
			ctx.fillStyle = "#000000";
			ctx.fillRect(meteorites[i].x-1, meteorites[i].y-1, 2, 2);
		}
	}

	if(spaceship.enable){
		spaceship.draw();
	}


	ctx.fillStyle = "#000000";
	ctx.fillRect(spaceship.x-1, spaceship.y-1, 2, 2);

	ctx.textAlign = "left";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText("score: " + score, 10, 50);

	if(pause && !shop){
		pauseMenu.draw();
	}

	if(pause && shop){
		shopMenu.draw();
	}
}

function clickSpaceOrMouse(){
	if(!pause){
		cahangeDirection();
	}
}

function cahangeDirection(){
	spaceship.directionRight = spaceship.directionRight === true ? false : true;
}

function eulerToRadians(eulerAngle){
	return eulerAngle / 180 * Math.PI;
}

function magnitude(x, y){
	return Math.sqrt(x*x + y*y);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function makeMeteorite(){
	for(i = 0; i < meteorites.length; i++){
		if(!meteorites[i].enable){
			meteorites[i] = new Meteorite();
			meteorites[i].enable = true;

			if(getRandomInt(5) === 0){
				meteorites[i].isCoin = true;
				meteorites[i].img = coinImg;
			}
			break;
		}
	}
}

function replayClick(){
	score = 0;

	for(i = 0; i < meteorites.length; i++){
		meteorites[i].enable = false;
	}

	spaceship.enable = true;

	pause = false;
}

function shopClick(){
	shop = true;
}

function backClick(){
	shop = false;
}

var highScore = user.highScore, score = 0, pause = true, shop = false, isRecord = false, total = user.totalScore;

var meteorites = new Array(3);
meteorites[0] = new Meteorite();
meteorites[1] = new Meteorite();
meteorites[2] = new Meteorite();

var autoInterval = setInterval(update, 15);
var autoInterval2 = setInterval(makeMeteorite, 1000);
document.addEventListener("mousedown", clickSpaceOrMouse);
document.addEventListener("keydown", (event) => {if(event.code == 'Space') clickSpaceOrMouse()});
