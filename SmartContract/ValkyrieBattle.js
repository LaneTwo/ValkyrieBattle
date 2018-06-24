'use strict';

var ValkyrieBattleContract = function () {    
    LocalContractStorage.defineProperty(this, "owner", null);
    LocalContractStorage.defineProperty(this, "matchCount", null);
    LocalContractStorage.defineProperty(this, "userGameCount", null);
    LocalContractStorage.defineProperty(this, "leaderboardArray", null);
    LocalContractStorage.defineMapProperty(this, "matches");
    LocalContractStorage.defineMapProperty(this, "userNameMap");
};

const ACTION_EXPIRE_TIMEOUT = 120;

ValkyrieBattleContract.prototype = {
    init: function () {
        this.owner = Blockchain.transaction.from;
        this.matchCount = 0;
        this.userGameCount = 0; 
        this.leaderboardArray = [];          
    },
    setName: function(name){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS.");
        }
        if(name.length < 3 || name.length >20){
            throw new Error("Name length should be greater than 3 and less than 20.");
        }
        //TODO: check valid characters

        this.userNameMap.set(Blockchain.transaction.from, name);
    },

    createNewGame: function(gameHash){
        this.matches.set(this.matchCount, {
            gameId: this.matchCount,
            state: "WaitingForMatch", // WaitingForMatch, WaitingForAccept, GameInProgress, EndGameRequested, GameEnded
            created: Blockchain.transaction.timestamp,
            playerGameHash: [gameHash.toLowerCase(),''],
            playerAddress: [Blockchain.transaction.from, ''],
            playerLayout:['',''],
            currentPlayer: 0,
            attemptToMatchTimestamp: 0,
            lastMoveTimestamp: 0, 
            winner: 0,
            winningReason: 0, // 0: normal, 1: timeout, 2: cheat
            attacks:[]
        });

        this.matchCount = this.matchCount + 1;

        return this.matchCount - 1;
    },

    matchGame: function(gameId, gameHash){
        var cannotMatchGame = false;
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.playerAddress[0] === Blockchain.transaction.from){
            throw new Error("Not allowed to play with yourself.");
        }

        if(game.state !== "WaitingForMatch"){
            if(game.state === "WaitingForAccept"){
                var currentTime = Math.floor(Date.now() / 1000); 
                if(currentTime < (game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT)){
                    cannotMatchGame = true;
                }
            }else{
                cannotMatchGame = true;
            }            
        }

        if(cannotMatchGame){
            throw new Error("Can only match game not started.");
        }
        game.playerGameHash[1] = gameHash.toLowerCase();
        game.playerAddress[1] = Blockchain.transaction.from;
        game.attemptToMatchTimestamp = Blockchain.transaction.timestamp;
        game.state = "WaitingForAccept";

        this.matches.set(gameId, game);
    },

    acceptGame: function(gameId){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.playerAddress[0] !== Blockchain.transaction.from){
            throw new Error("You are not the creator of the game");
        }

        if(game.state !== "WaitingForAccept"){
            throw new Error("Can only accept ready to start game");
        }else{
            var currentTime = Math.floor(Date.now() / 1000); 
            if(currentTime > (game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT)){
                throw new Error("Can't accept expired game.");
            }

            game.lastMoveTimestamp = Blockchain.transaction.timestamp;
            game.state = "GameInProgress";

            this.matches.set(gameId, game);
        }
    },

    attack: function(gameId, x, y){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.state !== "GameInProgress"){
            throw new Error("Can only move on started game");
        }

        if(game.playerAddress[game.currentPlayer] !== Blockchain.transaction.from){
            throw new Error("It't not your turn to move.");
        }

        var currentTime = Math.floor(Date.now() / 1000); 
        if(currentTime > (game.lastMoveTimestamp + 90)){
            this._updateGameResult(gameId, 1 - game.currentPlayer, 1);
        }else{
            game.attacks.push({
                player: 1 - game.currentPlayer,
                x: x,
                y: y,
                state: -1
            });

            game.lastMoveTimestamp = Blockchain.transaction.timestamp;
            game.currentPlayer = 1 - game.currentPlayer;

            this.matches.set(gameId, game);
        }
    },

    updateAttackResult: function(gameId, result){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.state !== "GameInProgress"){
            throw new Error("Can only update on started game");
        }

        if(game.playerAddress[game.currentPlayer] !== Blockchain.transaction.from){
            throw new Error("It't not your turn to move.");
        }

        if(result < 0 || result > 2){
            throw new Error("Invalid attack result.");
        }
        
        var currentTime = Math.floor(Date.now() / 1000); 
        if(currentTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){
            this._updateGameResult(gameId, 1 - game.currentPlayer, 1);
        }else{
            var attack = game.attacks[game.attacks.length - 1];
            if(attack.state !== -1){
                throw new Error("Can only update position state once.");
            }

            attack.state = result;

            game.lastMoveTimestamp = Blockchain.transaction.timestamp;
            this.matches.set(gameId, game);
        }        
    },

    requestEndGame: function(gameId, enemyGameLayout, ownGameLayout, salt){        
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }
        if(game.state !== "GameInProgress"){
            throw new Error("Can only request end inprogress game.");
        }

        if(game.playerAddress[game.currentPlayer] !== Blockchain.transaction.from){
            throw new Error("It't not your turn to move.");
        }

        var ownGameHash = this._MD5(ownGameLayout + salt);

        if(ownGameHash === game.playerGameHash[game.currentPlayer]){
            // TODO: Verify layout and every move
            game.state = "EndGameRequested";
            game.lastMoveTimestamp = Blockchain.transaction.timestamp;
            game.playerLayout[game.currentPlayer] = ownGameLayout;
            game.playerLayout[1 - game.currentPlayer] = enemyGameLayout;            

            this.matches.set(gameId, game);
        }else{
            // Cheater
            this._updateGameResult(gameId, 1 - game.currentPlayer, 2);
        }

    },

    challengeEnemy: function(gameId, ownGameLayout, salt){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }
        if(game.state !== "EndGameRequested"){
            throw new Error("Can only response when end game requested.");
        }

        if(game.playerAddress[1 - game.currentPlayer] !== Blockchain.transaction.from){
            throw new Error("Only game player can do this.");
        }

        var currentTime = Math.floor(Date.now() / 1000); 
        if(currentTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){
            this._updateGameResult(gameId, game.currentPlayer, 1);
        }else{
            var ownGameHash = this._MD5(ownGameLayout + salt);

            if(ownGameHash === game.playerGameHash[1 - game.currentPlayer]){
                // TODO: Verify layout and every move
                game.state = "GameEnded";
                
                var winner = game.currentPlayer;
                if(ownGameLayout !== game.playerLayout[1 - game.currentPlayer]){
                    winner = 1 - game.currentPlayer;
                    game.playerLayout[1 - game.currentPlayer] = ownGameLayout;
                }

                this._updateGameResult(gameId, winner, 0);
            }else{
                // Cheater
                this._updateGameResult(gameId, game.currentPlayer, 2);
            }
        }        
    },

    surrenderGame: function(gameId){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.state !== "GameInProgress" && game.state !== "EndGameRequested"){
            throw new Error("Can only surrender not ended game");
        }

        var player = -1;

        if(game.playerAddress[0] === Blockchain.transaction.from){
            player = 0;
        }

        if(game.playerAddress[1] === Blockchain.transaction.from){
            player = 1;
        }

        if(player === -1){
            throw new Error("Only game player allowed.");
        }

        this._updateGameResult(gameId, 1 - player, 0);
    },

    cancelGame: function(gameId){
        var gameNotStarted = true;
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.playerAddress[0] !== Blockchain.transaction.from){
            throw new Error("Not game creator.");
        }

        if(game.state !== "WaitingForMatch"){
            if(game.state === "WaitingForAccept"){
                var currentTime = Math.floor(Date.now() / 1000); 
                if(currentTime < (game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT)){
                    gameNotStarted = false;
                }
            }else{
                gameNotStarted = false;
            }            
        }

        if(!gameNotStarted){
            throw new Error("Can only cancel game not started.");
        }

        this.matches.set(gameId, null);
    },

    updateTimeoutGameResult: function(gameId){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        if(game.state !== "GameInProgress" && game.state !== "EndGameRequested"){
            throw new Error("Can only update timeout game");
        }

        var currentTime = Math.floor(Date.now() / 1000); 
        if(currentTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){

            var winner = 1 - game.currentPlayer;
            if(game.state === "EndGameRequested"){
                winner = game.currentPlayer;
            }
            this._updateGameResult(gameId, winner, 1);
        }
    },

    // Call function
    getName: function(){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS.");
        }
        var userName = this.userNameMap.get(Blockchain.transaction.from);
        if(!userName){
            userName = Blockchain.transaction.from;
        }
        return userName;
    },

    getUnmatchedGame: function(){
        var unmatchedGames = [];
        for(var i = 0; i < this.matchCount; i++){
            var game = this.matches.get(i);
            if(!game){
                continue;
            }
            game["players"] = [this.userNameMap.get(game.playerAddress[0]), this.userNameMap.get(game.playerAddress[1])];

            if(game.state === "WaitingForMatch"){
                unmatchedGames.push(game);
            }else if(game.state === "WaitingForAccept"){
                var currentTime = Math.floor(Date.now() / 1000); 
                if((game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT) < currentTime){
                    unmatchedGames.push(game);
                }
            }
        }

        return unmatchedGames;
    },

    getUserCurrentOpenGame: function(){
        var gameFound = false;
        var openGame = { gameId: -1, isCreator: false};
        for(var i = 0; i < this.matchCount; i++){
            var game = this.matches.get(i);
            if(!game){
                continue;
            }
            if(game.state !== "GameEnded"){
                if(game.playerAddress[0] === Blockchain.transaction.from){
                    openGame.gameId = i;
                    openGame.isCreator = true;
                    gameFound = true;
                }else if(game.playerAddress[1] === Blockchain.transaction.from){
                    openGame.gameId = i;
                    openGame.isCreator = false;
                    gameFound = true;
                }
            }

            if(gameFound){
                break;
            }
        }

        return openGame;
    },

    getGame: function(gameId){
        var game = this.matches.get(gameId);
        if(!game){
            throw new Error("Invalid game ID.");
        }

        return game;
    },

    getAllGames: function(){
        var games = [];
        for(var i = 0; i < this.matchCount; i++){
            var game = this.matches.get(i);
            if(!game){
                continue;
            }
            game["players"] = [this.userNameMap.get(game.playerAddress[0]), this.userNameMap.get(game.playerAddress[1])];
            games.push(game);
        }

        return games;
    },
    
    getLeaderboard: function(){
        var leaderboardArray = this.leaderboardArray;
        for(var i = 0; i < leaderboardArray.length; i++){
            var userName = this.userNameMap.get(leaderboardArray[i].address);
            if(!userName){
                userName = leaderboardArray[i].address;
            }
            leaderboardArray[i]["name"] = userName;
        }
        return leaderboardArray;
    },

    // Internal function
    _verifyGameLayout:function(gameId, ownGameLayout, salt){
        //TODO: anti-cheating verify
    },

    _updateGameResult: function(gameId, winner, winningReason){
        var game = this.matches.get(gameId);
        game.state = "GameEnded";
        game.winner = winner;
        game.winningReason = winningReason;

        this.matches.set(gameId, game);
        
        // Update user record
        this._updateUserLeaderboard(game.playerAddress[winner], true);
        this._updateUserLeaderboard(game.playerAddress[1 - winner], false);
    },

    _updateUserLeaderboard: function(address, isWon){
        var userIndex = 0;
        var newUser = true;
        for(userIndex = 0; userIndex < this.leaderboardArray.length; userIndex++){
            if(this.leaderboardArray[userIndex].address === address){
                newUser = false;
                break;
            }
        }

        if(newUser){
            var userGame = {
                address: address,
                win: isWon? 1 : 0,
                loss: isWon? 0 : 1
            }

            var leaderboardArray = this.leaderboardArray;
            leaderboardArray.push(userGame);
            this.leaderboardArray = leaderboardArray;
        }else{
            var leaderboardArray = this.leaderboardArray;
            var userGame = leaderboardArray[userIndex];

            if(isWon){
                userGame.win++;
            }else{
                userGame.loss++;
            }
            leaderboardArray[userIndex] = userGame;

            this.leaderboardArray = leaderboardArray;
        }
    },

    // MD5 related function
    _RotateLeft: function(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    },
    _AddUnsigned: function(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
        } else {
                return (lResult ^ lX8 ^ lY8);
        }
    },

    _F: function(x,y,z) { return (x & y) | ((~x) & z); },
    _G: function(x,y,z) { return (x & z) | (y & (~z)); },
    _H: function(x,y,z) { return (x ^ y ^ z); },
    _I: function(x,y,z) { return (y ^ (x | (~z))); },

    _FF: function(a,b,c,d,x,s,ac) {
        a = this._AddUnsigned(a, this._AddUnsigned(this._AddUnsigned(this._F(b, c, d), x), ac));
        return this._AddUnsigned(this._RotateLeft(a, s), b);
    },

    _GG: function(a,b,c,d,x,s,ac) {
        a = this._AddUnsigned(a, this._AddUnsigned(this._AddUnsigned(this._G(b, c, d), x), ac));
        return this._AddUnsigned(this._RotateLeft(a, s), b);
    },

    _HH: function(a,b,c,d,x,s,ac) {
        a = this._AddUnsigned(a, this._AddUnsigned(this._AddUnsigned(this._H(b, c, d), x), ac));
        return this._AddUnsigned(this._RotateLeft(a, s), b);
    },

    _II: function(a,b,c,d,x,s,ac) {
        a = this._AddUnsigned(a, this._AddUnsigned(this._AddUnsigned(this._I(b, c, d), x), ac));
        return this._AddUnsigned(this._RotateLeft(a, s), b);
    },

    _ConvertToWordArray: function(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
                lWordCount = (lByteCount-(lByteCount % 4))/4;
                lBytePosition = (lByteCount % 4)*8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    },

    _WordToHex: function(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
                lByte = (lValue>>>(lCount*8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    },

    _Utf8Encode: function (text) {
        text = text.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < text.length; n++) {

                var c = text.charCodeAt(n);

                if (c < 128) {
                        utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                }

        }

        return utftext;
    },

    _MD5: function(text){
        var x=Array();
        var k,AA,BB,CC,DD,a,b,c,d;
        var S11=7, S12=12, S13=17, S14=22;
        var S21=5, S22=9 , S23=14, S24=20;
        var S31=4, S32=11, S33=16, S34=23;
        var S41=6, S42=10, S43=15, S44=21;
     
        text = this._Utf8Encode(text);
     
        x = this._ConvertToWordArray(text);
     
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
     
        for (k=0;k<x.length;k+=16) {
                AA=a; BB=b; CC=c; DD=d;
                a=this._FF(a,b,c,d,x[k+0], S11,0xD76AA478);
                d=this._FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
                c=this._FF(c,d,a,b,x[k+2], S13,0x242070DB);
                b=this._FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
                a=this._FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
                d=this._FF(d,a,b,c,x[k+5], S12,0x4787C62A);
                c=this._FF(c,d,a,b,x[k+6], S13,0xA8304613);
                b=this._FF(b,c,d,a,x[k+7], S14,0xFD469501);
                a=this._FF(a,b,c,d,x[k+8], S11,0x698098D8);
                d=this._FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
                c=this._FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
                b=this._FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
                a=this._FF(a,b,c,d,x[k+12],S11,0x6B901122);
                d=this._FF(d,a,b,c,x[k+13],S12,0xFD987193);
                c=this._FF(c,d,a,b,x[k+14],S13,0xA679438E);
                b=this._FF(b,c,d,a,x[k+15],S14,0x49B40821);
                a=this._GG(a,b,c,d,x[k+1], S21,0xF61E2562);
                d=this._GG(d,a,b,c,x[k+6], S22,0xC040B340);
                c=this._GG(c,d,a,b,x[k+11],S23,0x265E5A51);
                b=this._GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
                a=this._GG(a,b,c,d,x[k+5], S21,0xD62F105D);
                d=this._GG(d,a,b,c,x[k+10],S22,0x2441453);
                c=this._GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
                b=this._GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
                a=this._GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
                d=this._GG(d,a,b,c,x[k+14],S22,0xC33707D6);
                c=this._GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
                b=this._GG(b,c,d,a,x[k+8], S24,0x455A14ED);
                a=this._GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
                d=this._GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
                c=this._GG(c,d,a,b,x[k+7], S23,0x676F02D9);
                b=this._GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
                a=this._HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
                d=this._HH(d,a,b,c,x[k+8], S32,0x8771F681);
                c=this._HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
                b=this._HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
                a=this._HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
                d=this._HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
                c=this._HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
                b=this._HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
                a=this._HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
                d=this._HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
                c=this._HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
                b=this._HH(b,c,d,a,x[k+6], S34,0x4881D05);
                a=this._HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
                d=this._HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
                c=this._HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
                b=this._HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
                a=this._II(a,b,c,d,x[k+0], S41,0xF4292244);
                d=this._II(d,a,b,c,x[k+7], S42,0x432AFF97);
                c=this._II(c,d,a,b,x[k+14],S43,0xAB9423A7);
                b=this._II(b,c,d,a,x[k+5], S44,0xFC93A039);
                a=this._II(a,b,c,d,x[k+12],S41,0x655B59C3);
                d=this._II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
                c=this._II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
                b=this._II(b,c,d,a,x[k+1], S44,0x85845DD1);
                a=this._II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
                d=this._II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
                c=this._II(c,d,a,b,x[k+6], S43,0xA3014314);
                b=this._II(b,c,d,a,x[k+13],S44,0x4E0811A1);
                a=this._II(a,b,c,d,x[k+4], S41,0xF7537E82);
                d=this._II(d,a,b,c,x[k+11],S42,0xBD3AF235);
                c=this._II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
                b=this._II(b,c,d,a,x[k+9], S44,0xEB86D391);
                a=this._AddUnsigned(a,AA);
                b=this._AddUnsigned(b,BB);
                c=this._AddUnsigned(c,CC);
                d=this._AddUnsigned(d,DD);
                }
     
            var temp = this._WordToHex(a)+this._WordToHex(b)+this._WordToHex(c)+this._WordToHex(d);
     
            return temp.toLowerCase();        
    }

};
module.exports = ValkyrieBattleContract;