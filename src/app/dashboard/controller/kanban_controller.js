/*
 * Copyright (c) 2015 Codethink Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * A controller that manages our logged-in dashboard
 */
angular.module('sb.dashboard').controller('KanbanController',
    function ($scope, currentUser, Story, Task, Worklist,
              SubscriptionEvent, $modal, Board, Project) {
        'use strict';

        function addItem(list, listitem) {
            return function(item) {
                item.list_item_id = listitem.id;
                item.type = listitem.item_type;
                item.position = listitem.list_position;
                list.push(item);
                list.sort(function(a, b) {
                    return a.position - b.position;
                });
            };
        }

        function resolverFactory(worklist) {
            return function(items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.item_type === 'task') {
                        Task.get({
                            id: item.item_id
                        }).$promise.then(
                            addItem(worklist.items, item));
                    } else if (item.item_type === 'story') {
                        Story.get({
                            id: item.item_id
                        }).$promise.then(
                            addItem(worklist.items, item));
                    }
                }
            };
        }

        function getLane(listID) {
            for (var n = 0; n < $scope.lanes.length; n++) {
                if ($scope.lanes[n].list_id === listID) {
                    return $scope.lanes[n];
                }
            }
        }

        function loadWorklists() {
            Worklist.browse({board_id: 1}, function (results) {
                $scope.worklists = results.sort(function(a, b) {
                    return getLane(a.id).position - getLane(b.id).position;
                });
                for (var i = 0; i < results.length; i++) {
                    $scope.worklists[i].items = [];
                    Worklist.ItemsController.get({
                        id: results[i].id
                    }).$promise.then(resolverFactory($scope.worklists[i]));
                }
            });
        }

        function loadBoard() {
            var params = {id: 1};
            Board.get(params).$promise
                .then(function(board) {
                    $scope.board = board;
                    $scope.lanes = board.lanes;
                })
                .then(loadWorklists);
        }

        loadBoard();

        function showAddItemModal(worklist) {
            var modalInstance = $modal.open({
                templateUrl: 'app/worklists/template/additem.html',
                controller: 'WorklistAddItemController',
                resolve: {
                    worklist: function() {
                        return worklist;
                    }
                }
            });

            return modalInstance.result;
        }

        $scope.addItem = function(worklist) {
            showAddItemModal(worklist).finally(loadWorklists);
        };

        $scope.showEditForm = false;
        $scope.toggleEditMode = function() {
            $scope.showEditForm = !$scope.showEditForm;
        };

        $scope.update = function() {
            $scope.board.lanes = [];
            for (var i = 0; i < $scope.worklists.length; i++) {
                var lane = $scope.worklists[i];
                $scope.board.lanes.push(lane.id);
            }
            $scope.board.$update().then($scope.toggleEditMode);
        };

        $scope.remove = function() {
            var modalInstance = $modal.open({
                templateUrl: 'app/boards/template/archive.html',
                controller: 'BoardArchiveController',
                resolve: {
                    board: function() {
                        return $scope.board;
                    }
                }
            });

            return modalInstance.result;
        };

        /**
         * Project typeahead search method.
         */
        $scope.searchProjects = function (value) {
            return Project.browse({name: value, limit: 10}).$promise;
        };

        /**
         * Formats the project name.
         */
        $scope.formatProjectName = function (model) {
            if (!!model) {
                return model.name;
            }
            return '';
        };

        /**
         * Select a new project.
         */
        $scope.selectNewProject = function (model) {
            $scope.board.project_id = model.id;
        };

        /**
         * Add a lane.
         */
        $scope.addLane = function () {
            $scope.worklists.push(new Worklist({
                title: '',
                editing: true
            }));
        };

        $scope.removeLane = function (worklist) {
            var idx = $scope.worklists.indexOf(worklist);
            $scope.worklists.splice(idx, 1);
            worklist.$delete().then(loadWorklists);
        };

        function updateBoardLanes() {
            for (var i = 0; i < $scope.worklists.length; i++) {
                var lane = getLane($scope.worklists[i].id);
                lane.position = i;
            }
            $scope.board.lanes = $scope.lanes;
            $scope.board.$update();
        }

        $scope.toggleEditLane = function(worklist) {
            if (worklist.editing) {
                if (worklist.id === undefined || worklist.id === null) {
                    worklist.$create()
                        .then(updateBoardLanes)
                        .then(loadWorklists);
                } else {
                    worklist.$update().then(function(list) {
                        list.items = [];
                        Worklist.ItemsController.get({
                            id: worklist.id
                        }).$promise.then(resolverFactory(list));
                    });
                }
            }
            worklist.editing = !worklist.editing;
        };

        $scope.lanesSortable = {
            orderChanged: updateBoardLanes,
            accept: function (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            }
        };

        function moveCardInLane(result) {
            var list = result.source.sortableScope.$parent.worklist;
            for (var i = 0; i < list.items.length; i++) {
                var item = list.items[i];
                item.position = i;
                Worklist.ItemsController.update({
                    id: list.id,
                    item_id: item.list_item_id,
                    list_position: item.position
                });
            }
        }

        function moveCardBetweenLanes(result) {
            var src = result.source.sortableScope.$parent.worklist;
            var dst = result.dest.sortableScope.$parent.worklist;
            for (var i = 0; i < src.items.length; i++) {
                var item = src.items[i];
                item.position = i;
                Worklist.ItemsController.update({
                    id: src.id,
                    item_id: item.list_item_id,
                    list_position: item.position
                });
            }
            for (var j = 0; j < dst.items.length; j++) {
                var item = dst.items[j];
                item.position = j;
                item.list_id = dst.id;
                Worklist.ItemsController.update({
                    id: dst.id,
                    item_id: item.list_item_id,
                    list_position: item.position,
                    list_id: item.list_id
                });
            }
        }

        $scope.cardsSortable = {
            orderChanged: moveCardInLane,
            itemMoved: moveCardBetweenLanes
        };
    });
