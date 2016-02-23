////used to control barcode API
//
//var resultDiv;
//
////image capture + resize function
//var cameraOptions = {
//    quality: 100,
//    targetWidth: 480,
//    targetHeight: 480,
//    destinationType: Camera.DestinationType.DATA_URL,
//    correctOrientation: true
//}
//
////document.addEventListener("deviceready", init, false);
////
////document.addEventListener("deviceready", onDeviceReady, false);
////
////function init() {
////	document.querySelector("#startScan").addEventListener("touchend", scanCode, false);
////	resultDiv = document.querySelector("#results");
////}
//
//document.addEventListener("deviceready", takePicture, false);
//
//function takePicture(){
//    alert("I would like to go there");
//    document.querySelector("#takePic").addEventListener("touchend", photo, false);
//}
//
//function photo(){
//    navigator.camera.getPicture(function onSuccess(imageData){
//            var image = document.getElementById('image');
//            image.src = "data:image/jpeg;base64," + imageData;
//    }, function onFail(message){
//        console.log(message);
//    }, cameraOptions);
//}
