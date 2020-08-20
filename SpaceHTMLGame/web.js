var user = {
	id:0,
	totalScore: 0,
	highScore: 0,
	onLoaded: ();
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
	vkBridge.send("VKWebAppStorageGet", {"keys": ["totalScore", "highScore"]})
		.then(data => {
			user.totalScore = data.keys.totalScore;
			user.highScore = data.keys.highScore;
		})
		.catch(error => {
			console.log("Something went wrong");
		});
	loaded();
}

function saveSaves(){
	vkBridge.send("VKWebAppStorageSet", {"key": "totalScore", "value": user.totalScore})
		.then(data => {
			console.log("Success!");
		})
		.catch(error => {
			console.log("Something went wrong");
		});

	vkBridge.send("VKWebAppStorageSet", {"key": "highScore", "value": user.highScore})
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