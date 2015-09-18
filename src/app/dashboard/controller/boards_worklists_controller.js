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
angular.module('sb.dashboard').controller('BoardsWorklistsController',
    function ($scope, currentUser, Worklist, Board) {
        'use strict';

        // Load the boards belonging to the logged in user.
        function getLane(listID, board) {
            for (var n = 0; n < board.lanes.length; n++) {
                if (board.lanes[n].list_id === listID) {
                    return board.lanes[n];
                }
            }
        }

        function loadItems(board) {
            return function() {
                for (var i = 0; i < board.worklists.length; i++) {
                    var worklist = board.worklists[i];
                    worklist.items = Worklist.ItemsController.get({
                        id: worklist.id
                    });
                }
            };
        }

        function resolveLanes(board) {
            return function(worklists) {
                board.worklists = worklists.sort(function(a, b) {
                    return getLane(a.id, board).position -
                           getLane(b.id, board).position;
                });
            };
        }

        Board.browse({creator_id: currentUser.id}).$promise
            .then(function(boards) {
                for (var i = 0; i < boards.length; i++) {
                    var board = boards[i];
                    Worklist.browse({
                        board_id: board.id
                    }).$promise
                        .then(resolveLanes(board))
                        .then(loadItems(board));
                }
                $scope.boards = boards;
            });

        // Load the worklists belonging to the logged in user.
        $scope.worklists = [];
        Worklist.browse({
            creator_id: currentUser.id
        }).$promise.then(function(worklists) {
            for (var i = 0; i < worklists.length; i++) {
                var worklist = worklists[i];
                worklist.items = Worklist.ItemsController.get({
                    id: worklist.id
                });
            }
            $scope.worklists = worklists;
        });
    });
