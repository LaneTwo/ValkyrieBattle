
WalletWrapper = function(){
    this.contractAddress = "n1uLx1U5rjZS6yjTXdhB9egFYiv7X5MRajs";
    var NebPay = require("nebpay");
    //this.callbackUrl = NebPay.config.mainnetUrl;    
    this.callbackUrl = NebPay.config.testnetUrl;
    this.nebPay = new NebPay();
    this.timer = null;
}

WalletWrapper.prototype = {
    setName: function(name){
        var serialNumber;
    
        var listener = function(resp) {
          console.log("set user name listener resp: " + JSON.stringify(resp));
          localStorage.setItem("userName", name);
        }
    
        var callFunction = "setName";
        var callArgs = "[\"" + name + "\"]";    
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });
    },
    getName: function(callback){
        var listener = function(resp) {
          //console.log("getName listener resp: " + resp);
          callback(JSON.parse(resp.result));
        }
    
        var callFunction = "getName";
        var callArgs = "";
    
        this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });
    },
    getGame: function(gameId, callback){
        var listener = function(resp) {
          //console.log("getGame listener resp: " + JSON.stringify(resp));
          callback(JSON.parse(resp.result));
        }
    
        var callFunction = "getGame";
        var callArgs = "["+ gameId+ "]";
    
        this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });        
    },
    getUnmatchedGame: function(callback){
        var listener = function(resp) {
          //console.log("getUnmatchedGame listener resp: " + resp);
          callback(resp.result);
        }
    
        var callFunction = "getUnmatchedGame";
        var callArgs = "";
    
        this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });        
    },
    getAllGames: function(callback){
        var listener = function(resp) {
          //console.log("getAllGames listener resp: " + resp);
          callback(JSON.parse(resp.result));
        }
    
        var callFunction = "getAllGames";
        var callArgs = "";
    
        this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });        
    },
    getLeaderboard: function(callback){
        var listener = function(resp) {
          //console.log("getLeaderboard listener resp: " + resp);
          callback(JSON.parse(resp.result));
        }
    
        var callFunction = "getLeaderboard";
        var callArgs = "";
    
        this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });        
    },
    getUserCurrentOpenGame: function(callback){
        var listener = function(resp) {
          //console.log("getUserCurrentOpenGame listener resp: " + resp);
          callback(JSON.parse(resp.result));
        }
    
        var callFunction = "getUserCurrentOpenGame";
        var callArgs = "";
    
        this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });        
    },
    createNewGame: function(planeLayout, salt, callback){
        var serialNumber;
    
        if(localStorage.getItem("createdGameId")){
            callback("You already created a game, please wait for accept or join other's game.");
            return;
        }
        var listener = function(resp) {
          //console.log("createNewGame listener resp: " + resp);
        }
    
        var layoutStr = JSON.stringify(planeLayout) + salt;
        var gameHash = md5(layoutStr);
        var callFunction = "createNewGame";
        var callArgs = "[\"" + gameHash + "\"]";    
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });

        // queryPayInfo is not very reliable to get the execute_result
        // setTimeout(() => {
        //     this.nebPay.queryPayInfo(serialNumber, {callback: this.callbackUrl})   //search transaction result from server (result upload to server by app)
        //     .then(function (resp) {
        //         console.log("createNewGame fresh resp: " + resp);
        //         var data = JSON.parse(resp).data;
        //         if(data.execute_error === ""){
        //             localStorage.setItem("currentGameId", data.execute_result);
        //             localStorage.setItem("currentGameLayout", JSON.stringify(planeLayout));
        //             localStorage.setItem("currentGameSalt", salt);
        //             callback("Game created.");
        //         }       
        //     })
        //     .catch(function (err) {
        //         console.log(err);
        //     });
        // }, 20000);  



        this.queryCreatedGame(planeLayout, salt);
        // setTimeout(() => {
        //     this.getUserCurrentOpenGame(function(result){
        //         if(result.gameId >= 0){
        //             localStorage.setItem("createdGameId", result.gameId);
        //             localStorage.setItem("createdGameLayout", JSON.stringify(planeLayout));
        //             localStorage.setItem("createdGameSalt", salt);
        //         }
        //     })
        // }, 5000);
        
    },

    queryCreatedGame: function(planeLayout, salt){
        this.getUserCurrentOpenGame(result => {
            if(result.gameId >= 0){
                localStorage.setItem("createdGameId", result.gameId);
                localStorage.setItem("createdGameLayout", JSON.stringify(planeLayout));
                localStorage.setItem("createdGameSalt", salt);
                clearTimeout(this.timer);
            }
        });
        this.timer = setTimeout(() => {
            this.queryCreatedGame(planeLayout, salt);
        }, 3000);
    },

    matchGame: function(gameId, planeLayout, salt){
        var listener = function(resp) {
            localStorage.setItem("challengeGameId", result.gameId);
            localStorage.setItem("challengeGameLayout", JSON.stringify(planeLayout));
            localStorage.setItem("challengeGameSalt", salt);
        }
    
        var layoutStr = JSON.stringify(planeLayout) + salt;
        var gameHash = md5(layoutStr);
        var callFunction = "matchGame";
        var callArgs = "["+ gameId.toString() +",\"" + gameHash + "\"]";    
        this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });        
    },

    acceptGame: function(gameId){
        var serialNumber;
    
        // if(localStorage.getItem("currentPlayingGameId")){
        //     callback("You are playing a created a game, please wait for accept or join other's game.");
        //     return;
        // }
        var listener = function(resp) {
            localStorage.setItem("playingGameId", gameId);
          //console.log("createNewGame listener resp: " + resp);
        }
    
        var layoutStr = JSON.stringify(planeLayout) + salt;
        var gameHash = md5(layoutStr);
        var callFunction = "acceptGame";
        var callArgs = "["+ gameId.toString() + "]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },

    attack: function(gameId, x, y){
        var listener = function(resp) {
        }
    
        var callFunction = "attack";
        var callArgs = "["+ gameId.toString() + ","+ x.toString()+ "," + y.toString()+ "]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },

    updateAttackResult: function(gameId, result){
        var listener = function(resp) {
        }
    
        var callFunction = "updateAttackResult";
        var callArgs = "["+ gameId.toString() + ","+ result.toString() + "]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },

    requestEndGame: function(gameId, enemyGameLayout){
        var listener = function(resp) {
        }

        var createdGameId = localStorage.setItem("createdGameId");
        var ownGameLayout = "";
        var salt = "";

        if(createdGameId == gameId){
            ownGameLayout =  localStorage.getItem("createdGameLayout");
            salt =  localStorage.getItem("createdGameSalt");
        }else{
            ownGameLayout =  localStorage.getItem("challengeGameLayout");
            salt =  localStorage.getItem("challengeGameSalt"); 
        }
    
        var callFunction = "requestEndGame";
        var callArgs = "["+ gameId.toString() + ",\""+ JSON.stringify(enemyGameLayout) + "\"," +
            ",\""+ JSON.stringify(ownGameLayout) + "\"," + ",\""+ salt.toString() + "\"]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },

    challengeEnemy: function(gameId, ownGameLayout, salt){
        var listener = function(resp) {
        }

        var createdGameId = localStorage.setItem("createdGameId");
        var ownGameLayout = "";
        var salt = "";

        if(createdGameId == gameId){
            ownGameLayout =  localStorage.getItem("createdGameLayout");
            salt =  localStorage.getItem("createdGameSalt");
        }else{
            ownGameLayout =  localStorage.getItem("challengeGameLayout");
            salt =  localStorage.getItem("challengeGameSalt"); 
        }
    
        var callFunction = "requestEndGame";
        var callArgs = "["+ gameId.toString() + ",\""+ JSON.stringify(enemyGameLayout) + "\"," +
            ",\""+ JSON.stringify(ownGameLayout) + "\"," + ",\""+ salt.toString() + "\"]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },

    surrenderGame: function(gameId){
        var listener = function(resp) {
        }
    
        var callFunction = "surrenderGame";
        var callArgs = "["+ gameId.toString() + "]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },
   
    updateTimeoutGameResult: function(gameId){
        var listener = function(resp) {
        }
    
        var callFunction = "updateTimeoutGameResult";
        var callArgs = "["+ gameId.toString() + "]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    },

    cancelGame: function(gameId){
        var listener = function(resp) {
            localStorage.setItem("createdGameId", '');
            localStorage.setItem("createdGameLayout", '');
            localStorage.setItem("createdGameSalt", '');
        }
    
        var callFunction = "cancelGame";
        var callArgs = "["+ gameId.toString() + "]";
        serialNumber = this.nebPay.call(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener
        });
    }
}
