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
 * A controller that manages the worklist page
 */
angular.module('sb.worklist').controller('WorklistDetailController',
    function ($scope, $modal, $timeout, $stateParams, Worklist) {
        'use strict';

        function loadWorklist() {
            var params = {id: $stateParams.worklistID};
            Worklist.get(params).$promise.then(function(result) {
                $scope.worklist = result;
                Worklist.loadContents(result, true);
            });
        }

        // Load the worklist.
        loadWorklist();

        function saveWorklist() {
            $scope.worklist.$update().then(function() {
                Worklist.loadContents($scope.worklist, true);
            });
        }

        $scope.toggleEditMode = function() {
            if (!$scope.worklist.editing) {
                $scope.worklist.editing = true;
            } else {
                $scope.worklist.editing = false;
                saveWorklist();
            }
        };

        $scope.sortableOptions = {
            accept: function (sourceHandle, dest) {
                return sourceHandle.itemScope.sortableScope.$id === dest.$id;
            },
            orderChanged: function (e) {
                var worklist = e.dest.sortableScope.worklist;
                for (var i = 0; i < worklist.items.length; i++) {
                    var item = worklist.items[i];
                    item.position = i;
                    Worklist.ItemsController.update({
                        id: worklist.id,
                        item_id: item.list_item_id,
                        list_position: item.position
                    });
                }
            }
        };

        function showAddItemModal() {
            var modalInstance = $modal.open({
                templateUrl: 'app/worklists/template/additem.html',
                controller: 'WorklistAddItemController',
                resolve: {
                    worklist: function() {
                        return $scope.worklist;
                    },
                    valid: function() {
                        return function() {
                            // No limit on the contents of worklists
                            return true;
                        };
                    }
                }
            });

            return modalInstance.result;
        }

        $scope.addItem = function() {
            showAddItemModal().finally(loadWorklist);
        };

        $scope.removeItem = function(item) {
            Worklist.ItemsController.delete({
                id: $scope.worklist.id,
                item_id: item.list_item_id
            }).$promise.then(function() {
                var idx = $scope.worklist.items.indexOf(item);
                $scope.worklist.items.splice(idx, 1);
            });
        };

        function showDeleteModal() {
            var modalInstance = $modal.open({
                templateUrl: 'app/dashboard/template/worklist_delete.html',
                controller: 'WorklistDeleteController',
                resolve: {
                    worklist: function() {
                        return $scope.worklist;
                    }
                }
            });

            // Return the modal's promise.
            return modalInstance.result;
        }

        $scope.remove = function() {
            showDeleteModal();
        };
    });
