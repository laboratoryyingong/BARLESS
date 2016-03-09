var myApp = angular.module('todoApp', ['ui.sortable', 'ui.bootstrap']);
var stepApp = angular.module('stepApp', []);
var tempID;

//first page controller
myApp.filter('greet', function(){
    return function(name){
      return 'Hello, ' + name + '!';
    };
});

myApp.directive('customModals', function( $http, $compile){
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            ngModel: '='
        },
        template: '',
        link: function(scope, el, attrs){
//            console.log(scope);
            scope.modalId = attrs.modalId;
            scope.title = attrs.modalTitle;

            $http.jsonp(attrs.modalSrc);

            getContents = function(data){
                $compile(data.contents)(scope, function(compliledElement, scope){
                    el.append(compliledElement);
                });
            };
        }
    }

});

myApp.controller('sortableController', function($scope) {

  var tmpList = [];
  for (var i = 1; i <= 2; i++){
    tmpList.push({
      id : 'item' + i,
      barcodeImg : 'public/img/lib-pictures/barCode.png'
//      text: 'BarCode ' + i,
//      number: 'BNVSD1231231',
//      value: i
    });
  }

  $scope.list = tmpList;

  $scope.sortingLog = [];

  $scope.sortableOptions = {
    handle: '.myHandle',
    activate: function() {
        console.log("activate");
    },
    beforeStop: function() {
        console.log("beforeStop");
    },
    change: function() {
        console.log("change");
    },
    create: function() {
        console.log("create");
    },
    deactivate: function() {
        console.log("deactivate");
    },
    out: function() {
        console.log("out");
    },
    over: function() {
        console.log("over");
    },
    receive: function() {
        console.log("receive");
    },
    remove: function() {
        console.log("remove");
    },
    sort: function() {
        console.log("sort");
    },
    start: function() {
        console.log("start");
    },
    update: function(e, ui) {
      console.log("update");

      var logEntry = tmpList.map(function(i){
        return i.value;
      }).join(', ');
      $scope.sortingLog.push('Update: ' + logEntry);
    },
    stop: function(e, ui) {
      console.log("stop");

      // this callback has the changed model
      var logEntry = tmpList.map(function(i){
        return i.value;
      }).join(', ');
      $scope.sortingLog.push('Stop: ' + logEntry);
    }
  };

//new test
  $scope.test = function(){
       console.log("button clicked");
   };

});

myApp.controller('ModalDemoCtrl', function ($scope, $uibModal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

myApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
//step module controller
stepApp.controller('storeBarcodeController', ['$scope', storeBarcodeController]);

function storeBarcodeController($scope){
    $scope.inputPlaceholder = 'Please input your card\'s name';
    $scope.textPlaceholder = 'Please take some notes';
    $scope.card = {
        name : '',
        context : ''
    };

}


storeBarcodeController.prototype.save = function(){
//  init database
    var db = new PouchDB('LocalDB', {adapter : 'websql'});

//  various of explaination
    var name = document.getElementById('stepInput').value;
    var context = btoa(document.getElementById('notebook').value);
    var saveBtn = document.getElementById('saveBtn');
    var queryBtn = document.getElementById('queryBtn');
// get create barcode img based64 string
    var barcodeImg = document.getElementById('barcode');
    var barcodeImgSrc = barcodeImg.src.split(',');

    if (typeof window != "undefined"){
        window.PouchDB = PouchDB};

    if (name != null && context != null){
        db.post({
                    title : name,
                    info : {
                        'barcode_text' : barcodeInfo[0],
                        'barcode_format' : barcodeInfo[1]
                    },
                    _attachments : {
                        'barcode_img' : {
                            content_type : 'image/png',
                            data : barcodeImgSrc[1]
                        },
                        'card_img' : {
                            content_type : 'image/jpeg',
                            data : tempImageData
                        },
                        'notes' : {
                            content_type: 'text/plain',
                            data : context
                        }
                    }
                }
        ).then(function(response){
            alert("Your barcode has been saved, Thanks");

        }).catch(function(err){
            alert(err);
        });
    }else{
        alert("Please Check all form!");
    }

}

//init database
storeBarcodeController.prototype.init = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
    var img = tempImageData;
    console.log("****TEMP IMG DATA******" + tempImageData);
    var title = document.getElementById('stepInput').value;
    var notes = btoa(document.getElementById('notebook').value);

    db.get('mydoc').then(function(doc){

            return db.put(
                {
                    title : title,
                    _attachments : {
                        'barcode_img' : {
                            content_type : 'image/jpeg',
                            data : tempImageData
                        },
                        'notes' : {
                            content_type: 'text/plain',
                            data : notes
                        }
                    }
                }, 'mydoc', doc._rev).then(function(response){
                                            alert(JSON.stringify(response));
                                        }).catch(function(err){
                                            console.log(err);
                                        });


    });
}

//delete database
storeBarcodeController.prototype.deleteDB = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
    db.destroy().then(function(response){
        alert("bar-code has been deleted");
    }).catch(function(err){
        console.log(err);
    });
//    db.get('mydoc', {attachments: true}).then(function(doc){
//        alert(JSON.stringify(doc));
//    }).catch(function(err){
//        alert(err.message);
//    });
}

//database info
storeBarcodeController.prototype.information = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
        db.info().then(function(result){
            console.log(result)
        }).catch(function(err){
            console.log(err);
        });
}

//insert document
storeBarcodeController.prototype.insertDoc = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
        db.put(doc1).then(function(response){
            console.log(response);
        }).catch(function(err){
            console.log(err);
        });
}

//update document
storeBarcodeController.prototype.updateDoc = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
        db.get('rec1').then(function(doc){
            return db.put({
                _id: 'rec1',
                _rev: doc._rev,
                "name" : "Card Name 2",
                "type" : "QR-Code 2",
                "note" : ["note1", "note2", "note3"],
                "_attachments" : {
                        "myattachement.txt" : {
                            "content_type" : "text/plain",
                            data: "aGVsbG8gd29ybGQ="
                            }
                }
            });
        }).then(function(result){
            console.log(result);
        }).catch(function(err){
            console.log("Received new err" + err);
        });
}

//fetch doc
storeBarcodeController.prototype.fetchDoc = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
    db.get('rec1').then(function(doc){
        console.log("The doc name is " + doc.name);
    }).catch(function(err){
        console.log(err);
    });

}

//temporary queries
storeBarcodeController.prototype.query = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});

    db.query(function (doc, emit) {
        emit(doc.title);
    }, {key : 'Cool'}).then(function (result) {
        alert("This is that Doc" + JSON.stringify(result.rows[0].id));
        tempID = JSON.stringify(result.rows[0].id);
        alert("tempID " + tempID);
    }).catch(function (err) {
        alert("Can not find it");
    });

}

//functions

