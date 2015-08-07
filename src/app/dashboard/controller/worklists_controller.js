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
 * A controller that manages the worklist test area
 */
angular.module('sb.dashboard').controller('DashboardWorklistsController',
    function ($scope, $modal, currentUser, Worklist, Task, Story) {
        'use strict';

        function addItem(list, listitem) {
            return function(item) {
                item.type = listitem.item_type;
                item.position = listitem.list_position;
                list.push(item);
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

        // Load the worklists.
        function handleSearchResult(results) {
            $scope.worklists = results;
            for (var i = 0; i < results.length; i++) {
                $scope.worklists[i].items = [];
                var resolver = resolverFactory($scope.worklists[i]);
                Worklist.ItemsController.get({
                    id: results[i].id
                }).$promise.then(resolver);
            }
        }
        var params = {creator_id: currentUser.id};
        Worklist.browse(params, handleSearchResult);

        $scope.index = 'none';
        $scope.sortableOptions = {
            accept: function (sourceHandle, dest) {
                return sourceHandle.itemScope.sortableScope.$id === dest.$id;
            },
            orderChanged: function (e) {
                var new_index = e.dest.index;
                e.source.itemScope.item.position = new_index;
            }
        };

        $scope.addItem = function(worklist) {
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
        };

        $scope.remove = function (worklist) {
            var modalInstance = $modal.open({
                templateUrl: 'app/dashboard/template/worklist_delete.html',
                controller: 'WorklistDeleteController',
                resolve: {
                    worklist: function() {
                        return worklist;
                    }
                }
            });

            // Return the modal's promise.
            return modalInstance.result;
        };
    });
