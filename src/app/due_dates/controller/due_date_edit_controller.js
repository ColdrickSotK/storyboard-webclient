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
 * Controller for the "new due date" modal popup.
 */
angular.module('sb.due_date').controller('DueDateEditController',
    function ($scope, $modalInstance, $state, DueDate, board, dueDate) {
        'use strict';

        /**
         * Save changes to the due date.
         */
        function saveDueDate() {
            DueDate.update($scope.dueDate, function (result) {
                    $scope.isSaving = false;
                    $modalInstance.close(result);
                }
            );
        }

        /**
         * Saves the due date.
         */
        $scope.save = function() {
            $scope.isSaving = true;
            $scope.dueDate.date.second(0);
            saveDueDate();
        };

        /**
         * Close this modal without saving.
         */
        $scope.close = function() {
            $modalInstance.dismiss('cancel');
        };

        // Create a blank DueDate to begin with.
        $scope.isSaving = false;
        $scope.dueDate = dueDate;
        $scope.modalTitle = 'Edit Due Date';
    });
