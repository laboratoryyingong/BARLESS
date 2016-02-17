//used to control barcode API

var resultDiv;

document.addEventListener("deviceready", init, false);

document.addEventListener("deviceready", onDeviceReady, false);

function init() {
	document.querySelector("#startScan").addEventListener("touchend", startScan, false);
	resultDiv = document.querySelector("#results");
}

function startScan() {

	try{
            var scanner = cordova.plugins.barcodeScanner;
            scanner.scan(
            function (result) {
                var s = "Result: " + result.text + "<br/>" +
                "Format: " + result.format + "<br/>" +
                "Cancelled: " + result.cancelled;
                resultDiv.innerHTML = s;
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
        );
    }catch(error){
        console.log(error.message);
    }


}

function onDeviceReady(){

}
