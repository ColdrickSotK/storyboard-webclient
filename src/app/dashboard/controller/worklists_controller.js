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
    function ($scope, $modal, $timeout, currentUser, Worklist, Task, Story) {
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

        function loadWorklists() {
            var params = {creator_id: currentUser.id};
            Worklist.browse(params, handleSearchResult);
        }

        // Load the worklists.
        loadWorklists();

        function saveWorklistItems(worklist) {
            for (var i = 0; i < worklist.items.length; i++) {
                var item = worklist.items[i];
                Worklist.ItemsController.update({
                    id: worklist.id,
                    item_id: item.list_item_id,
                    list_position: item.position
                });
            }
        }

        function saveWorklist(worklist) {
            Worklist.update({
                id: worklist.id,
                title: worklist.title
            });
        }

        $scope.toggleEditMode = function(worklist) {
            if (!worklist.editing) {
                worklist.editing = true;
            } else {
                worklist.editing = false;
                saveWorklist(worklist);
            }
        };

        $scope.sortableOptions = {
            accept: function (sourceHandle, dest) {
                return sourceHandle.itemScope.sortableScope.$id === dest.$id;
            },
            orderChanged: function (e) {
                var new_pos = e.dest.index;
                var old_pos = e.source.index;
                var worklist = e.dest.sortableScope.worklist;
                var i = 0;
                var item = {};
                $scope.old_pos = old_pos;
                $scope.new_pos = new_pos;
                if (new_pos > old_pos) {  // item moved down list
                    for (i = 0; i < worklist.items.length; i++) {
                        item = worklist.items[i];
                        if (item.position > old_pos &&
                            item.position <= new_pos) {
                            item.position--;
                        }
                    }
                } else if (old_pos > new_pos) {  // item moved up list
                    for (i = 0; i < worklist.items.length; i++) {
                        item = worklist.items[i];
                        if (item.position < old_pos &&
                            item.position >= new_pos) {
                            item.position++;
                        }
                    }
                }
                e.source.itemScope.item.position = new_pos;
                worklist.items.sort(function (a, b) {
                    return a.position - b.position;
                });
                saveWorklistItems(worklist);
            }
        };

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

        $scope.removeItem = function(worklist, item) {
            $scope.worklists = [];
            Worklist.ItemsController.delete({
                id: worklist.id,
                item_id: item.list_item_id
            }).$promise.finally(loadWorklists);
        };

        function showDeleteModal(worklist) {
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
        }

        $scope.remove = function(worklist) {
            showDeleteModal(worklist).finally(loadWorklists);
        };
    });
