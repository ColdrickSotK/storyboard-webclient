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
angular.module('sb.board').controller('BoardDetailController',
    function ($scope, Worklist, $modal, Board, Project, $stateParams,
              $document, $window) {
        'use strict';

        function loadBoard(onlyContents) {
            var params = {id: $stateParams.boardID};
            if (onlyContents) {
                Board.loadContents($scope.board, true, true);
            } else {
                Board.get(params).$promise
                    .then(function(board) {
                        $scope.board = board;
                        Board.loadContents(board, true, true);
                    });
            }
        }

        loadBoard();

        $scope.permissions = Board.Permissions.get({id: $stateParams.boardID});

        function showAddItemModal(worklist) {
            var modalInstance = $modal.open({
                templateUrl: 'app/worklists/template/additem.html',
                controller: 'WorklistAddItemController',
                resolve: {
                    worklist: function() {
                        return worklist;
                    },
                    valid: function() {
                        var board = $scope.board;
                        return function(item) {
                            var valid = true;
                            angular.forEach(board.worklists, function(list) {
                                angular.forEach(list.items, function(listItem) {
                                    var type = item.type.toLowerCase();
                                    if (item.value === listItem.id &&
                                        type === listItem.type) {
                                        valid = false;
                                    }
                                });
                            });
                            return valid;
                        };
                    }
                }
            });

            return modalInstance.result;
        }

        $scope.addItem = function(worklist) {
            showAddItemModal(worklist)
                .finally(function() {
                    Worklist.loadContents(worklist, true);
                });
        };

        $scope.showEditForm = false;
        $scope.toggleEditMode = function() {
            $scope.showEditForm = !$scope.showEditForm;
        };

        $scope.update = function() {
            $scope.board.$update().then(function() {
                loadBoard(true);
                $scope.toggleEditMode();
            });
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
            $scope.board.worklists.push(new Worklist({
                id: null,
                title: '',
                editing: true
            }));
        };

        $scope.removeLane = function (worklist) {
            var idx = $scope.board.worklists.indexOf(worklist);
            $scope.board.worklists.splice(idx, 1);
            worklist.$delete();
        };

        $scope.removeCard = function (worklist, item) {
            Worklist.ItemsController.delete({
                id: worklist.id,
                item_id: item.list_item_id
            }).$promise.then(function() {
                var idx = worklist.items.indexOf(item);
                worklist.items.splice(idx, 1);
            });
        };

        function updateBoardLanes(newList) {
            for (var i = 0; i < $scope.board.worklists.length; i++) {
                var lane = Board.getLane($scope.board,
                                         $scope.board.worklists[i].id);
                if (!lane) {
                    $scope.board.lanes.push({
                        list_id: newList.id,
                        board_id: $scope.board.id,
                        position: i
                    });
                } else {
                    lane.position = i;
                }
            }
            $scope.board.$update().then(function() {
                Board.loadContents($scope.board, true, true);
            });
        }

        $scope.toggleEditLane = function(worklist) {
            if (worklist.editing) {
                if (worklist.id === null) {
                    worklist.$create().then(updateBoardLanes);
                } else {
                    worklist.$update().then(function(list) {
                        Worklist.loadContents(list, true);
                    });
                }
            }
            worklist.editing = !worklist.editing;
        };

        /**
         * Callbacks and options for ngSortable directives.
         */
        function maybeScrollContainer(itemPosition, containment, eventObj) {
            if (eventObj) {
                var container = document.getElementsByClassName(
                    'kanban-board')[0];
                var offsetX = ($window.pageXOffset ||
                               $document[0].documentElement.scrollLeft);
                var targetX = eventObj.pageX - offsetX;
                var leftBound = container.clientLeft + container.offsetLeft;
                var rightBound = leftBound + container.clientWidth;

                if (targetX < leftBound) {
                    container.scrollLeft -= 10;
                } else if (targetX > rightBound) {
                    container.scrollLeft += 10;
                }
            }
        }

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
            moveCardInLane(result);
            var dst = result.dest.sortableScope.$parent.worklist;
            for (var i = 0; i < dst.items.length; i++) {
                var item = dst.items[i];
                item.position = i;
                item.list_id = dst.id;
                Worklist.ItemsController.update({
                    id: dst.id,
                    item_id: item.list_item_id,
                    list_position: item.position,
                    list_id: item.list_id
                });
            }
        }

        $scope.lanesSortable = {
            orderChanged: updateBoardLanes,
            dragMove: maybeScrollContainer,
            accept: function (sourceHandle, dest) {
                return sourceHandle.itemScope.sortableScope.$id === dest.$id;
            }
        };

        $scope.cardsSortable = {
            orderChanged: moveCardInLane,
            itemMoved: moveCardBetweenLanes,
            dragMove: maybeScrollContainer,
            accept: function (sourceHandle, dest) {
                var srcParent = sourceHandle.itemScope.sortableScope.$parent;
                var dstParentSortable = dest.$parent.sortableScope;
                if (!srcParent.sortableScope &&
                    $scope.permissions.editBoard) {
                    return false;
                } else if (!$scope.permissions.editBoard) {
                    return true;
                }
                return srcParent.sortableScope.$id === dstParentSortable.$id;
            }
        };
    });
