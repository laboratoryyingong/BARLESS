var myApp = angular.module('todoApp', ['ui.sortable']);
var stepApp = angular.module('stepApp', []);

var doc1 = {
        "_id" : "rec1",
        "name" : "Card Name",
        "type" : "QR-Code",
        "note" : ["note1", "note2", "note3"],
        "_attachments" : {
            "myattachement.txt" : {
                "content_type" : "text/plain",
                data: "aGVsbG8gd29ybGQ="
            }
        }
    };
var doc2 = {
        "_id" : "rec1",
        "name" : "Card Name 2",
        "type" : "QR-Code 2",
        "note" : ["note1", "note2", "note3"],
        "_attachments" : {
            "myattachement.txt" : {
                "content_type" : "text/plain",
                data: "aGVsbG8gd29ybGQ="
            }
        }
    };

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
      id: 'item' + i,
      text: 'BarCode ' + i,
      number: 'BNVSD1231231',
      value: i
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

stepApp.controller('storeBarcodeController', ['$scope', storeBarcodeController]);

function storeBarcodeController($scope){
    // $scope
}

storeBarcodeController.prototype.click = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
    var title = document.getElementById('stepInput').value;

    if (typeof window != "undefined"){
        window.PouchDB = PouchDB};

    db.put({
        _id : 'mydoc',
        title : title
    }).then(function(response){
        alert("New Barcode has been inserted")
    }).catch(function(err){
        console.log(err);
    });


}

//init database
storeBarcodeController.prototype.init = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
    var title = document.getElementById('stepInput').value;
    var notes = btoa(document.getElementById('notebook').value);

    db.get('mydoc').then(function(doc){

            return db.put(
                {
                    title : title,
                    _attachments: {
                        'notes' : {
                            content_type: 'text/plain',
                            data: notes
                        }
                    }
                }, 'mydoc', doc._rev).then(function(response){
                                            console.log(response);
                                        }).catch(function(err){
                                            console.log(err);
                                        });


    });
}

//delete database
storeBarcodeController.prototype.deleteDB = function(){
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
    db.destroy().then(function(response){

    }).catch(function(err){
        console.log(err);
    });
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
    db.query(function(doc, emit){
        emit(doc.name);
    }, {key: 'Card Name 2'}).then(function(result){
        alert(JSON.stringify(result));
    }).catch(function(err){

    });
}

//create database services
myApp.factory('DBService', ['$q', DBService]);

function DBService($q){
    var _db;
    var _barcode;

    return{
        initDB: initDB,
    };

    function initDB(){
        _db = new PouchDB('barcode', {adapter : 'websql'});
    };
}

function addDoc(doc){
    return $q.when(_db.post(doc));
};

function deleteDoc(doc){
    return $q.when(_db.remove(doc));
};

