var barcodeInfo = [];
var stepTrigger = 0;

//init page
$(document).ready(function() {

    resizeDiv();

});

//tab control
$('.right').click(function(){
    if(stepTrigger == 1){
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
        stepTrigger = 0;
    }else{
        alert("Please press icon to scan!");
    }

});

$('.left').click(function(){
    $('.nav-tabs > .active').prev('li').find('a').trigger('click');
    stepTrigger = 0
});

//image capture + resize function
var cameraOptions = {
    quality: 100,
    targetWidth: 480,
    targetHeight: 480,
    destinationType: Camera.DestinationType.DATA_URL,
    correctOrientation: true
}

var tempImageData;

function takePicture(){
    alert("Please take a picture of your card!");
    navigator.camera.getPicture(function onSuccess(imageData){
            var image = document.getElementById('image');
            image.src = "data:image/jpeg;base64," + imageData;
            tempImageData = imageData;
            //step trigger
            stepTrigger = 1;
    }, function onFail(message){
        console.log(message);
    }, cameraOptions);

};

//resise windows
function resizeDiv(){
    vpw = $(window).width();
    vph = $(window).height();
    $('#mainBody').css({'height': (vph - 50) + 'px'});
    $('#image').css({'height': (vph - 280) + 'px'})
}

//barcode scan functions
function scanCode() {
    cordova.plugins.barcodeScanner.scan(
    function(result){
        barcodeInfo[0] = result.text;
        barcodeInfo[1] = result.format;
        barcodeInfo[2] = result.cancelled;
        encodeData();
        if (result.text != null && result.cancelled != true){
            stepTrigger = 1;
            console.log("scan successfully!")
        }else{
            stepTrigger = 0;
            console.log("error happen!")
        }

    },
    function(error){
        alert("Scan failed: " + error);
    }
    );

}

function encodeData(){

    if(barcodeInfo != null){
        switch(barcodeInfo[1]){
            case "EAN_8":
                $("#barcode").JsBarcode(barcodeInfo[0],{format:"EAN", displayValue:true, fontSize:20});
                break;
            case "EAN_13":
                $("#barcode").JsBarcode(barcodeInfo[0],{format:"EAN", displayValue:true, fontSize:20});
                break;
            case "CODE_128":
                $("#barcode").JsBarcode(barcodeInfo[0],{format:"CODE128", displayValue:true, fontSize:10});
                break;
            case "CODE_39":
                $("#barcode").JsBarcode(barcodeInfo[0],{format:"CODE39", displayValue:true, fontSize:10});
                break;
            case "UPC_A":
                $("#barcode").JsBarcode(barcodeInfo[0],{format:"UPC-A", displayValue:true, fontSize:20});
                break;
            case "ITF":
                $("#barcode").JsBarcode(barcodeInfo[0],{format:"ITF", displayValue:true, fontSize:20});
                break;
            default:
                console.log("Can not find it");
                break;

        }


    }else{
        alert("no context");
    }

}

