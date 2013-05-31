var app = angular.module('Todo', ['angular-underscore']);

app.value('dbname', 'todo');

pouch = function ($rootScope, $q, $log, dbname) {
    this.scope = $rootScope;
    this.q = $q;
    this.log = $log;

    this.db = Pouch(dbname);
}

pouch.prototype.generateCallback = function (promise) {
    var self = this;
    return function (err, response) {
        if (err) {
            self.log.error(err);
            promise.reject(err);
        } else {
            promise.resolve(response);
        }
        self.scope.$digest();
    }
};

pouch.prototype.allDocs = function () {
    this.log.log("All Docs");

    var deferred = this.q.defer();
    this.db.allDocs(this.generateCallback(deferred));

    return deferred.promise;
}

pouch.prototype.del = function (doc) {
    this.log.log("Removing");
    var defferred = this.q.defer();

    this.db.remove(doc, this.generateCallback(defferred));

    return defferred.promise;
}

pouch.prototype.get = function (docID) {
    this.log.log("Getting");
    var defferred = this.q.defer();

    this.db.get(docID, this.generateCallback(defferred));

    return defferred.promise;
}

pouch.prototype.put = function (doc) {
   this.log.log("Putting");
    var defferred = this.q.defer();

    this.db.put(doc, this.generateCallback(defferred));

    return defferred.promise;
}

pouch.prototype.post = function (doc) {
    this.log.log("Posting");

    var defferred = this.q.defer();

    this.db.post(doc, this.generateCallback(defferred));

    return defferred.promise;
}

app.service('pouch', pouch);

var todoCtrl = function ($scope, pouch) {
    $scope.todos = [];
    pouch.allDocs().then($scope.loadTodos);

    $scope.remaining = function () {
        return _.reduce($scope.todos, function (sum, todo) {
            return sum + (!todo.done)
        }, 0);
    }

    $scope.updateTodo = function (todo) {
        pouch.get(todo._id).then(function (doc) {
            doc.done = todo.done;
            todo._rev = doc._rev;
            pouch.put(doc).then(function () {
            }, function (err) {
                console.log(err)
            });
        });
    }

    $scope.addTodo = function () {
        var newTodo = {
            _id: Math.uuid(),
            text: $scope.todoText,
            done: false
        }
        $scope.todos.push(newTodo);
        pouch.post(newTodo);
        $scope.todoText = '';
    }

    $scope.clearDone = function () {
        var newTodos = [];
        _.each($scope.todos, function (todo) {
            if (todo.done) {
                $scope.removeTodo(todo);
            } else {
                newTodos.push(todo);
            }
        });
        $scope.$apply (function () { $scope.todos = newTodos });;
    }

    $scope.removeTodo = function (todo) {
        pouch.get(todo._id).then(function (doc) { pouch.del(doc); });
    }

    $scope.loadTodos = function (todos) {
        var newTodos = [];

        _.each(todos, function (todo) {
            pouch.get(todo.id).then(function (doc) {
                console.log("push");
                newTodos.push(doc);
            });
        });

        $scope.$apply($scope.todos = newTodos);
    }
}
todoCtrl.$inject = ['$scope', 'pouch'];

app.controller("TodoCTRL", todoCtrl);