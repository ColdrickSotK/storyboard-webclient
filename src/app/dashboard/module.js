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
 * The storyboard dashboard module. Handles our index page.
 */
angular.module('sb.dashboard',
    [ 'sb.services', 'sb.templates', 'sb.auth', 'ui.router', 'ui.bootstrap'])
    .config(function ($stateProvider, SessionResolver) {
        'use strict';

        // Set an initial home page.
        $stateProvider
            .state('sb.index', {
                url: '/',
                templateUrl: 'app/dashboard/template/index.html',
                controller: 'HomeController',
                resolve: {
                    sessionState: SessionResolver.resolveSessionState
                }
            })
            .state('sb.dashboard', {
                abstract: true,
                url: '/dashboard',
                resolve: {
                    sessionState: SessionResolver.resolveSessionState,
                    currentUser: SessionResolver.requireCurrentUser
                },
                views: {
                    'submenu@': {
                        templateUrl: 'app/dashboard/template/submenu.html'
                    },
                    '@': {
                        template: '<div ui-view></div>'
                    }
                }
            })
            .state('sb.dashboard.home', {
                url: '/home',
                controller: 'DashboardController',
                templateUrl: 'app/dashboard/template/dashboard.html'
            })
            .state('sb.dashboard.kanban', {
                url: '/kanban',
                controller: 'DashboardController',
                templateUrl: 'app/dashboard/template/kanban.html'
            })
            .state('sb.dashboard.worklists', {
                url: '/worklists',
                controller: 'DashboardWorklistsController',
                templateUrl: 'app/dashboard/template/worklists.html'
            });
    });
