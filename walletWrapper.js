
WalletWrapper = function(){
    this.contractAddress = "n1vNUQePtQaQv3JRtAxXXVcc7HprYHeDq5N";
    var NebPay = require("nebpay");
    //this.callbackUrl = NebPay.config.mainnetUrl;    
    this.callbackUrl = NebPay.config.testnetUrl;
    this.nebPay = new NebPay();
}

WalletWrapper.prototype = {
    setName: function(name){
        var serialNumber;
    
        var listener = function(resp) {
          console.log("set user name listener resp: " + JSON.stringify(resp));
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
        var serialNumber;

        var listener = function(resp) {
          console.log("getName listener resp: " + JSON.stringify(resp));
          callback(resp);
        }
    
        var callFunction = "getName";
        var callArgs = "";
    
        serialNumber = this.nebPay.simulateCall(this.contractAddress, 0, callFunction, callArgs, {
            qrcode: {
                showQRCode: false
            },
            callback: this.callbackUrl,
            listener: listener  //set listener for extension transaction result
        });
    },
    getGame: function(gameId){

    },


}
