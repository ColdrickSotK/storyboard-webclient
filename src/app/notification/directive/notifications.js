/*
 * Copyright (c) 2014 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * This directive is a notification list renderer with all the trimmings.
 * Errors broadcast throughout the system will be collected and displayed here.
 */
angular.module('sb.notification').directive('notifications',
    function () {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'app/notification/template/notifications.html',
            controller: 'NotificationsController'
        };
    });
