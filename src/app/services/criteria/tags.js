/*
 * Copyright (c) 2016 Codethink Ltd.
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
 * This criteria resolver may be injected by individual resources that accept a
 * Tags search parameter.
 */
angular.module('sb.services').factory('Tags',
    function (Criteria, $q) {
        'use strict';

        /**
         * Return a Tags search parameter constructed from the passed search
         * string.
         */

        return {
            criteriaResolver: function (searchString) {
                var deferred = $q.defer();
                deferred.resolve([Criteria.create('Tags', searchString)]);

                return deferred.promise;
            }
        };
    });
