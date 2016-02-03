var myApp = angular.module('todoApp', ['ui.sortable']);
var doc = {
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
  for (var i = 1; i <= 1; i++){
    tmpList.push({
      text: 'BarCode ' + i,
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

myApp.controller('LocalDatabaseController', ['$scope', LocalDatabaseController]);

function LocalDatabaseController($scope){
    // $scope

}

LocalDatabaseController.prototype.init = function(){
//    alert("init local database");
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
}

LocalDatabaseController.prototype.information = function(){
//    alert("show database information");
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
        db.info();
}

LocalDatabaseController.prototype.insertDoc = function(){
//    alert("insert new doc to DB");
    var db = new PouchDB('LocalDB', {adapter : 'websql'});
        db.put(doc);
}
