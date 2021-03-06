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
 * This criteria resolver may be injected by individual resources that accept a
 * Story Status search parameters.
 */
angular.module('sb.services').factory('StoryStatus',
    function (Criteria, $q) {
        'use strict';

        /**
         * A list of valid story status items.
         *
         * @type {*[]}
         */
        var validStatusCriteria = [
            Criteria.create('StoryStatus', 'active', 'Active'),
            Criteria.create('StoryStatus', 'merged', 'Merged'),
            Criteria.create('StoryStatus', 'invalid', 'Invalid')
        ];

        /**
         * Return a criteria resolver for story status.
         */
        return {
            criteriaResolver: function (searchString) {
                var deferred = $q.defer();
                searchString = searchString || ''; // Sanity check
                searchString = searchString.toLowerCase(); // Lowercase search

                var criteria = [];
                validStatusCriteria.forEach(function (criteriaItem) {
                    var title = criteriaItem.title.toLowerCase();

                    // If we match the title, OR someone is explicitly typing in
                    // 'status'
                    if (title.indexOf(searchString) > -1 ||
                        'status'.indexOf(searchString) === 0) {
                        criteria.push(criteriaItem);
                    }
                });
                deferred.resolve(criteria);

                return deferred.promise;
            }
        };
    });
