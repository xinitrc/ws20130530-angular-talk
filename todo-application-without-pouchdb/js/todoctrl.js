/**
 * Created with JetBrains WebStorm.
 * User: martin
 * Date: 30.05.13
 * Time: 20:10
 * To change this template use File | Settings | File Templates.
 */
var app = angular.module("Todo", []);

var todoctrl = function ($scope) {
    $scope.todos = [];

    $scope.addTodo = function () {
        var newTodo = {
            done: false,
            text: $scope.todoText
        }

        $scope.todos.push(newTodo);
        $scope.todoText = '';
    }

    $scope.removeDone = function () {
        var newTodos = [];

        angular.forEach ($scope.todos, function (todo) {
           if(!todo.done) {
               newTodos.push(todo);
           }
        });

        $scope.todos = newTodos;

    }

    $scope.remaining = function () {
        var count = 0;
        angular.forEach($scope.todos, function (todo) {
            if (!todo.done) {
                count++;
            }
        });
        return count;
    }
}

app.controller("TodoCTRL", todoctrl);