<!--
  ~ Copyright (c) 2014 Hewlett-Packard Development Company, L.P.
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License"); you may
  ~ not use this file except in compliance with the License. You may obtain
  ~ a copy of the License at
  ~
  ~ 	http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  ~ WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
  ~ License for the specific language governing permissions and limitations
  ~ under the License.
  -->

<div class="container-fluid">
    <div class="row">
        <div class="col-xs-12">
            <h1>StoryBoard</h1>

            <p class="lead">A task tracking system for inter-related
                projects.</p>

        </div>
    </div>
    <div class="row">
        <div class="col-sm-8">

            <h2>Stories</h2>

            <p>It all begins with a <strong>story</strong>. A story is a
                bug report or proposed feature. Stories are then further
                split into <strong>tasks</strong>, which affect a given
                project and branch. You can easily track backports of
                bugs to a specific branch, or plan cross-project
                features.</p>
            <a href="#!/story" class="btn btn-primary">
                Access Stories
                <i class="fa fa-chevron-right"></i>
            </a>

            <h2>Projects</h2>

            <p>StoryBoard lets you efficiently track your work across a
                large number of interrelated projects. Flexible
                <strong>project groups</strong> lets you get the views
                that makes the most sense to you.</p>
            <a href="#!/project" class="btn btn-primary">
                Access Projects
                <i class="fa fa-chevron-right"></i>
            </a>

            <h2>But why?</h2>
            <p>The OpenStack project has run into a number of limitations
	        with existing tools; in particular, the workflow needed by
	        a highly-distributed system that spans multiple projects
	        is not well served.  This system uses the best concepts
	        from existing tools and goes beyond to support the needs
	        of the OpenStack project.</p>
            <p><a href="http://git.openstack.org/cgit/openstack-infra/storyboard/tree/README.rst"
               target="_blank"
               class="btn btn-primary">
                See project README
                <i class="fa fa-chevron-right"></i>
            </a></p>
            <small><p class="text-muted">Webclient version: <%- sha %></p></small>
        </div>
        <div class="col-sm-4">
            <hr class="visible-xs"/>
            <h4>Contributing</h4>

            <p>StoryBoard is open source! If you would like to contribute to
                the development of StoryBoard, you must follow the steps in the
                "If you're a developer, start here" section of this page:</p>

            <p><a href=" http://docs.openstack.org/infra/manual/developers.html"
                  target="_blank">
                http://docs.openstack.org/infra/manual/developers.html
            </a></p>

            <hr/>
            <h4>Attribution</h4>

            <p>StoryBoard was built with the help of the following openly
                licensed projects.</p>

            <p><strong>FontAwesome </strong></p>

            <p><a href="http://fontawesome.io/" target="_blank">
                The iconic font designed for Bootstrap
            </a></p>

            <p><strong>AngularJS</strong></p>

            <p><a href="http://angularjs.org/" target="_blank">
                Superheroic JavaScript Framework
            </a></p>

            <p><strong>Bootstrap</strong></p>

            <p><a href="http://getbootstrap.com/" target="_blank">
                Mobile first front-end framework
            </a></p>

        </div>
    </div>
</div>
</div>
