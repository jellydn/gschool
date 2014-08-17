'use strict';

angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, ['mean']);

});

// Dynamically add angular modules declared by packages
var packageModules = [];
for (var index in window.modules) {
    angular.module(window.modules[index].module, window.modules[index].angularDependencies || []);
    packageModules.push(window.modules[index].module);
}

// Default modules
// add 'ui.select2', 'ngSanitize'
var modules = ['ngEqualizer','ngCkeditor','infinite-scroll','cfp.loadingBar','angular-loading-bar','dialogs.main','pascalprecht.translate','toaster','ngAnimate','mgo-angular-wizard','ngSanitize','ngCookies', 'ngResource', 'ui.bootstrap', 'ui.router', 'mean.system', 'mean.auth'];
modules = modules.concat(packageModules);

// Combined modules
angular.module('mean', modules);
