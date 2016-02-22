var barcodeInfo = [];

//init page
$(document).ready(function() {

    resizeDiv();

});

//tab control
$('#forward').click(function(){
    $('.nav-tabs > .active').next('li').find('a').trigger('click');
});

$('#backward').click(function(){
  $('.nav-tabs > .active').prev('li').find('a').trigger('click');
});


//image capture + resize function
var cameraOptions = {
    quality: 100,
    targetWidth: 480,
    targetHeight: 480,
    destinationType: Camera.DestinationType.DATA_URL,
    correctOrientation: true
}

$('#takePic').click(function takePicture(){
    navigator.camera.getPicture(function onSuccess(imageData){
            var image = document.getElementById('image');
            image.src = "data:image/jpeg;base64," + imageData;
    }, function onFail(message){
        console.log(message);
    }, cameraOptions);

});

//resise windows
function resizeDiv(){
    vpw = $(window).width();
    vph = $(window).height();
    $('#mainBody').css({'height': (vph - 110) + 'px'});
}

function scanCode() {
    cordova.plugins.barcodeScanner.scan(
    function(result){
        barcodeInfo[0] = result.text;
        barcodeInfo[1] = result.format;
        barcodeInfo[2] = result.cancelled;
        encodeData();
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

