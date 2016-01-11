try{
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

}catch(e){
        console.log(e.message);}


//try{
//    var myElement = document.getElementById('slide1');
//    var myElement2 = document.getElementById('slide2');
//
//    var mc = new Hammer(myElement);
//    var mc2 = new Hammer(myElement2);
//
//    mc.on("panleft panright tap press", function(e){
//        var myElement = document.getElementById('items1');
//        var myBtn = document.getElementById('delBtn1');
//
//        switch(e.type){
//            case "panleft":
//                myElement.classList.remove('items-active');
//                myBtn.classList.remove('delBtn-active');
//                break;
//            case "panright":
//                myElement.classList.add('items-active');
//                myBtn.classList.add('delBtn-active');
//                break;
//        }
//    });
//
//    mc2.on("panleft panright tap press", function(e){
//        var myElement2 = document.getElementById('items2');
//        var myBtn2 = document.getElementById('delBtn2');
//
//        switch(e.type){
//            case "panleft":
//                myElement2.classList.remove('items-active');
//                myBtn2.classList.remove('delBtn-active');
//                break;
//            case "panright":
//                myElement2.classList.add('items-active');
//                myBtn2.classList.add('delBtn-active');
//                break;
//        }
//    });
//
//   }catch(e){
//       console.log(e.message);
//   }
$("#test1").click(function(){
    alert("Please press this one, Thanks")
});

var myElement = document.getElementsByClassName('item');

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
