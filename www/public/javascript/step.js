//global barcode information
var barcodeInfo = [];

//step forward trigger, 0 is stop, 1 is go-on
var stepTrigger = 1;

//init page
$(document).ready(function() {
    resizeDiv();
});

//bind tab control
$('.right').click(function(){
    if(stepTrigger == 1){
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
//        stepTrigger = 0;
    }else{
        alert("Please press icon to scan!");
    }

});

$('.left').click(function(){
    $('.nav-tabs > .active').prev('li').find('a').trigger('click');
    stepTrigger = 0
});

//image capture + resize function
//var cameraOptions = {
//    quality: 90,
//    targetWidth: 480,
//    targetHeight: 480,
//    destinationType: navigator.camera.DestinationType.DATA_URL,
//    correctOrientation: true
//};

var tempImageData;

function takePicture(){
    var image = document.getElementById('image');
    if(image.src != null){

        navigator.camera.getPicture(function onSuccess(imageData){
            alert("Successfully get data" + imageData);
            image.src = "data:image/jpeg;base64," + imageData;
            tempImageData = imageData;
            //step trigger
            stepTrigger = 1;
        }, function onFail(message){
            alert("Opps, not successful" + message);
        }, {
            quality: 90,
            targetWidth: 480,
            targetHeight: 480,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            correctOrientation: true
        });

    }else{

    }

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
        encodeData().then(
            convertToDataURLviaCanvas('http://bit.ly/18g0VNp', function(base64Img){
                console.log("based64Img of barcode is" + base64Img);
            });
        );
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

//barcode image to Based64 functions

function convertToDataURLviaCanvas(url, callback, outputFormat){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}

