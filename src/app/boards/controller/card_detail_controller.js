/*
 * Copyright (c) 2016 Codethink Limited
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
 * Controller for the card detail modal.
 */
angular.module('sb.board').controller('CardDetailController',
    function ($scope, card, board, Story, Task, DueDate, Worklist,
              $document, $timeout, $modalInstance) {
        'use strict';

        /**
         * Story description
         */
        $scope.toggleEditDescription = function() {
            $scope.editingDescription = !$scope.editingDescription;
        };

        $scope.editStoryDescription = function() {
            var params = {
                id: $scope.story.id,
                description: $scope.story.description
            };
            Story.update(params, function() {
                $scope.toggleEditDescription();
            });
        };

        /**
         * Due dates
         */
        function getDueDate(dateId) {
            for (var i = 0; i < board.due_dates.length; i++) {
                if (board.due_dates[i].id === dateId) {
                    return board.due_dates[i];
                }
            }
        }

        $scope.getRelevantDueDates = function(dates) {
            var boardDates = [];
            angular.forEach(board.due_dates, function(date) {
                boardDates.push(date.id);
            });

            $scope.relevantDates = [];
            angular.forEach(dates, function(date) {
                if (boardDates.indexOf(date) > -1) {
                    $scope.relevantDates.push(getDueDate(date));
                }
            });
        };

        $scope.toggleEditDueDate = function() {
            $scope.editingDueDate = !$scope.editingDueDate;
        };

        $scope.toggleAssignDueDate = function() {
            $scope.assigningDueDate = !$scope.assigningDueDate;
        };

        $scope.assignDueDate = function(date) {
            if (card.item_type === 'task') {
                date.tasks.push(card.task);
            } else if (card.item_type === 'story') {
                date.stories.push(card.story);
            }
            var params = {
                id: date.id,
                tasks: date.tasks,
                stories: date.stories
            };
            DueDate.update(params).$promise.then(function(updated) {
                if (card.item_type === 'task') {
                    card.task.due_dates.push(updated.id);
                    $scope.getRelevantDueDates(card.task.due_dates);
                } else if (card.item_type === 'story') {
                    card.story.due_dates.push(updated.id);
                    $scope.getRelevantDueDates(card.story.due_dates);
                }
                $scope.assigningDueDate = false;
            });
        };

        $scope.setDisplayDate = function(date) {
            card.resolved_due_date = date;
            var params = {
                id: card.list_id,
                item_id: card.id,
                list_position: card.list_position,
                display_due_date: date.id
            };
            Worklist.ItemsController.update(params, function() {
                $scope.editingDueDate = false;
            });
        };

        /**
         * Task assignee
         */
        $scope.toggleAssigneeTypeahead = function() {
            var typeahead = $document[0].getElementById('assignee');
            var assignLink = typeahead.getElementsByTagName('a')[0];
            $timeout(function() {
                assignLink.click();
            }, 0);
        };

        $scope.toggleEditAssignee = function() {
            $scope.editingAssignee = !$scope.editingAssignee;
        };

        $scope.updateTask = function(task) {
            var params = {
                id: task.id,
                assignee_id: task.assignee_id
            };
            Task.update(params, function() {
                $scope.editingAssignee = false;
            });
        };

        /**
         * Other
         */
        $scope.deleteCard = function() {
            Worklist.ItemsController.delete({
                id: $scope.card.list_id,
                item_id: $scope.card.id
            }, function() {
                $modalInstance.close('deleted');
            });
        };

        $scope.close = function() {
            $modalInstance.close('closed');
        };

        if (card.item_type === 'task') {
            $scope.story = Story.get({id: card.task.story_id});
            $scope.getRelevantDueDates(card.task.due_dates);
        } else if (card.item_type === 'story') {
            $scope.story = card.story;
        }

        angular.forEach(board.due_dates, function(date) {
            date.date = moment(date.date);
        });

        $scope.card = card;
        $scope.board = board;
        $scope.showDescription = true;
        $scope.assigningDueDate = false;
        $scope.editingDueDate = false;
        $scope.editingDescription = false;
        $scope.editingAssignee = false;
    }
);
