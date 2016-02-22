// Toggle button

var slideout = new Slideout({
'panel': document.getElementById('panel'),
'menu': document.getElementById('menu'),
'padding': 265,
'tolerance': 70,
'touch': false
});

var el = document.querySelector('.js-slideout-toggle')

el.addEventListener('click', function() {
    slideout.toggle();
});

var myElement = document.getElementById('slider');
var delBtn = document.getElementById("myCheck");

//init page
$(document).ready(function() {

    setTimeout(function(){
//	    console.log("timeout");
        setTimeout(layout(), 500);
    }, 500);

    function layout(){
        $('body').addClass('loaded');
        return function(){
            $('#loader-wrapper').hide();
        }
    };

    resizeDiv()

});

$('#reload').click(function(){
    location.reload();
});



//resise windows
function resizeDiv(){
    vpw = $(window).width();
    vph = $(window).height();

}//init page
$(document).ready(function() {

    setTimeout(function(){
//	    console.log("timeout");
        setTimeout(layout(), 500);
    }, 500);

    function layout(){
        $('body').addClass('loaded');
        return function(){
            $('#loader-wrapper').hide();
        }
    };

    resizeDiv()

});

$('#reload').click(function(){
    location.reload();
});

//image capture + resize function
//var cameraOptions = {
//    quality: 100,
//    targetWidth: 480,
//    targetHeight: 480,
//    destinationType: Camera.DestinationType.DATA_URL,
//    correctOrientation: true
//}
//
//$('#takePic').click(function takePicture(){
//    navigator.camera.getPicture(function onSuccess(imageData){
//            var image = document.getElementById('image');
//            image.src = "data:image/jpeg;base64," + imageData;
//    }, function onFail(message){
//        console.log(message);
//    }, cameraOptions);
//
//});


//resise windows
function resizeDiv(){
    vpw = $(window).width();
    vph = $(window).height();

}
