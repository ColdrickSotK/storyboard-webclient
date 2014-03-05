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
 * Session management service - keeps track of our current session state, mostly
 * by verifying the token state returned from the OpenID service.
 */
angular.module('sb.auth').factory('Session',
    function (SessionState, AccessToken, $rootScope, $log, $q, User) {
        'use strict';

        /**
         * The current session state.
         *
         * @type String
         */
        var sessionState = SessionState.PENDING;

        /**
         * Initialize the session.
         */
        function initializeSession() {
            var deferred = $q.defer();

            if (!AccessToken.getAccessToken() || AccessToken.isExpired()) {
                $log.debug('No token found');
                updateSessionState(SessionState.LOGGED_OUT);
                deferred.resolve();
            } else {
                // Validate the token currently in the cache.
                validateToken()
                    .then(function () {
                        $log.debug('Token validated');
                        updateSessionState(SessionState.LOGGED_IN);
                        deferred.resolve(sessionState);
                    }, function () {
                        $log.debug('Token not validated');
                        AccessToken.clear();
                        updateSessionState(SessionState.LOGGED_OUT);
                        deferred.resolve(sessionState);
                    });
            }

            return deferred.promise;
        }

        /**
         * Validate the token.
         */
        function validateToken() {
            var deferred = $q.defer();

            var id = AccessToken.getIdToken();

            User.read({id: id},
                function (user) {
                    deferred.resolve(user);
                }, function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        /**
         * Handles state updates and broadcasts.
         */
        function updateSessionState(newState) {
            if (newState !== sessionState) {
                sessionState = newState;
                $rootScope.$broadcast(sessionState);
            }
        }

        /**
         * Destroy the session (Clear the token).
         */
        function destroySession() {
            AccessToken.clear();
            updateSessionState(SessionState.LOGGED_OUT);
        }

        /**
         * Initialize and test our current session token.
         */
        initializeSession();

        // If we ever encounter a 401 error, make sure the session is destroyed.
        $rootScope.$on('http_401', function () {
            destroySession();
        });

        // Expose the methods for this service.
        return {
            /**
             * The current session state.
             */
            getSessionState: function () {
                return sessionState;
            },

            /**
             * Resolve the current session state, as a promise.
             */
            resolveSessionState: function () {
                var deferred = $q.defer();
                if (sessionState !== SessionState.PENDING) {
                    deferred.resolve(sessionState);
                } else {
                    var unwatch = $rootScope.$watch(function () {
                        return sessionState;
                    }, function () {
                        deferred.resolve(sessionState);
                        unwatch();
                    });
                }

                return deferred.promise;
            },

            /**
             * Are we logged in?
             */
            isLoggedIn: function () {
                return sessionState === SessionState.LOGGED_IN;
            },

            /**
             * Destroy the session.
             */
            destroySession: function () {
                destroySession();
            },

            /**
             * Update the session with a new (or null) token.
             */
            updateSession: function (token) {
                var deferred = $q.defer();
                if (!token) {
                    destroySession();
                    deferred.resolve(sessionState);
                } else {
                    AccessToken.setToken(token);
                    initializeSession().then(
                        function () {
                            deferred.resolve(sessionState);
                        },
                        function () {
                            deferred.resolve(sessionState);
                        }
                    );
                }

                return deferred.promise;
            }
        };
    });