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
angular.module('sb.dashboard').controller('BoardDetailController',
    function ($scope, Worklist, $modal, Board, Project, $stateParams) {
        'use strict';

        function loadBoard() {
            var params = {id: $stateParams.boardID};
            Board.get(params).$promise
                .then(function(board) {
                    $scope.board = board;
                    Board.loadContents(board, true, true);
                });
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
                loadBoard();
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

        $scope.lanesSortable = {
            orderChanged: updateBoardLanes,
            accept: function (sourceHandle, dest) {
                return sourceHandle.itemScope.sortableScope.$id === dest.$id;
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
            var item;
            for (var i = 0; i < src.items.length; i++) {
                item = src.items[i];
                item.position = i;
                Worklist.ItemsController.update({
                    id: src.id,
                    item_id: item.list_item_id,
                    list_position: item.position
                });
            }
            for (var j = 0; j < dst.items.length; j++) {
                item = dst.items[j];
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
            itemMoved: moveCardBetweenLanes,
            accept: function (sourceHandle, dest) {
                var srcParent = sourceHandle.itemScope.sortableScope.$parent;
                var dstParentSortable = dest.$parent.sortableScope;
                return srcParent.sortableScope.$id === dstParentSortable.$id;
            }
        };
    });
