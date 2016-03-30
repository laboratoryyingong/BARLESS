// Toggle button

var slideout = new Slideout({
'panel': document.getElementById('panel'),
'menu': document.getElementById('menu'),
'padding': 265,
'tolerance': 70,
'touch': false
});

var el = document.querySelector('.js-slideout-toggle')
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

el.addEventListener('click', function() {
    slideout.toggle();
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

    resizeDiv();

    $('#quote-carousel').carousel({
    pause: true,
    interval: 400000,
    });


});

$('#reload').click(function(){
    location.reload();
});


//resise windows: different f
function resizeDiv(){
    vpw = $(window).width();
    vph = $(window).height();
    $('#mainbody').css({'height': (vph - 140) + 'px'});

}
