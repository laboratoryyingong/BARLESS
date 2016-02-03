
var slideout = new Slideout({
'panel': document.getElementById('panel'),
'menu': document.getElementById('menu'),
'padding': 265,
'tolerance': 70,
'touch': false
});

// Toggle button
var el = document.querySelector('.js-slideout-toggle')
el.addEventListener('click', function() {
slideout.toggle();
});

var myElement = document.getElementById('slider');
var delBtn = document.getElementById("myCheck");

var mc = new Hammer(myElement);

mc.on("panleft panright tap press", function(e){
    switch(e.type){
        case "panleft":
            console.log(e.type);
            break;

        case "panright":
            console.log(e.type);
            break;

        case "press":
            alert("HAHA");
            break;

    }
});



