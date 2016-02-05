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

//var mc = new Hammer(myElement);
//
//mc.on("panleft panright tap press", function(e){
//    switch(e.type){
//        case "panleft":
//            console.log(e.type);
//            break;
//
//        case "panright":
//            console.log(e.type);
//            break;
//
//        case "press":
//            alert("HAHA");
//            break;
//
//    }
//});


$(document).ready(function() {

    setTimeout(function(){
//	    console.log("timeout");
        setTimeout(layout(), 500);
    }, 2500);

    function layout(){
        $('body').addClass('loaded');
        return function(){
            $('#loader-wrapper').hide();
        }
    };

});

$('#reload').click(function(){
    location.reload();
});
