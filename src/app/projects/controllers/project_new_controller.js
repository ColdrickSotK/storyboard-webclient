/*
 * Copyright (c) 2014 Hewlett-Packard Development Company, L.P.
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
 * View controller for the new project form. Includes an intermediary 'saving'
 * flag as well as room for an error response (though until we get a real API
 * that'll be a bit tricky to test).
 */
angular.module('sb.projects').controller('ProjectNewController',
    function ($scope, $state, Project) {
        'use strict';

        // View parameters.
        $scope.newProject = new Project();
        $scope.isCreating = false;
        $scope.error = {};

        /**
         * Submits the newly created project. If an error response is received,
         * assigns it to the view and unsets various flags. The template
         * should know how to handle it.
         */
        $scope.createProject = function () {

            // Clear everything and set the progress flag...
            $scope.isCreating = true;
            $scope.error = {};

            $scope.newProject.$create(
                function () {
                    // Success!
                    $state.go('project.list');
                },
                function (error) {
                    // Error received. Ho hum.
                    $scope.isCreating = false;
                    $scope.error = error;
                }
            );
        };
    });
