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
 * A directive that displays a list of projects in a table.
 *
 * @see ProjectListController
 */
angular.module('sb.search').directive('searchResults',
    function ($log, $parse, Criteria, $injector) {
        'use strict';

        return {
            restrict: 'A',
            scope: true,
            link: function ($scope, $element, args) {

                // Extract the resource type.
                var resourceName = args.searchResource;
                var pageSize = args.searchPageSize || 20;
                var searchWithoutCriteria =
                    args.searchWithoutCriteria === 'true';

                $scope.isSearching = false;
                $scope.searchResults = [];

                /**
                 * Handle error result.
                 */
                function handleErrorResult() {
                    $scope.isSearching = false;
                }

                /**
                 * Handle search result.
                 *
                 * @param results
                 */
                function handleSearchResult(results) {
                    $scope.searchResults = results;
                    $scope.isSearching = false;
                }

                /**
                 * Update the results when the criteria change
                 */
                function updateResults(criteria) {

                    // Extract the valid criteria from the provided ones.
                    $scope.validCriteria = Criteria
                        .filterCriteria(resourceName, criteria);

                    // You have criteria, but they may not be valid.
                    $scope.hasCriteria = criteria.length > 0;

                    // You have criteria, and all of them are valid for
                    // this resource.
                    $scope.hasValidCriteria =
                        searchWithoutCriteria ||
                        ($scope.validCriteria.length === criteria.length &&
                            $scope.hasCriteria);

                    // No need to search if our criteria aren't valid.
                    if (!$scope.hasValidCriteria) {
                        $scope.searchResults = [];
                        $scope.isSearching = false;
                        return;
                    }

                    var params = Criteria.mapCriteria(resourceName,
                        $scope.validCriteria);
                    var resource = $injector.get(resourceName);

                    if (!resource) {
                        $log.error('Invalid resource name: ' +
                            resourceName);
                        return;
                    }

                    // Apply paging.
                    params.limit = pageSize;

                    // If we don't actually have search criteria, issue a
                    // browse. Otherwise, issue a search.
                    if (!params.hasOwnProperty('q')) {
                        resource.query(params,
                            handleSearchResult,
                            handleErrorResult);
                    } else {
                        resource.search(params,
                            handleSearchResult,
                            handleErrorResult);
                    }
                }

                // Watch for changing criteria
                $scope.$watchCollection(
                    $parse(args.searchCriteria),
                    updateResults);
            }
        };
    });