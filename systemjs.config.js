/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */

(function(global) {
  // map tells the System loader where to look for things
  var map = {
    'app':                        'app', // 'dist',
    '@angular':                   'node_modules/@angular',
    'rxjs':                       'node_modules/rxjs',
    'angular2-logger':            'node_modules/angular2-logger', 
    'angular2-google-maps/core':  'node_modules/angular2-google-maps/core',
    'ng2-dropdown':               'node_modules/ng2-dropdown',
    'ng2-charts':                 'node_modules/ng2-charts',
    'moment':                     'node_modules/moment/',
    'ng2-responsive':              'node_modules/ng2-responsive',
    'ng2-bootstrap/ng2-bootstrap': 'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.umd.js'

  };
  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'app':                        { main: 'main.js',  defaultExtension: 'js' },
    'rxjs':                       { defaultExtension: 'js' },
    'angular2-logger':            { defaultExtension: 'js' }, 
    'angular2-google-maps/core':  { main: 'index.js', defaultExtension: 'js' },
    'ng2-dropdown':               { main: 'index.js', defaultExtension: 'js' },
    'ng2-charts':         { main: '/bundles/ng2-charts.js', defaultExtension: 'js' },
      'moment':                    { main: 'moment.js', defaultExtension: 'js' },
    'ng2-responsive':               { main: 'index.js', defaultExtension: 'js' }
  };
  // Definice angluar packages - jen definice, pridani do packages bude nize
  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade',
  ];


  //packages['angular2-google-maps'].main = '/core/core.umd.js';


  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }
  
  // Bundled (~40 requests):
  // pridani pro UMD package - pro tento priklad se pouziva toto
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  }
  // Most environments should use UMD; some (Karma) need the individual index files
  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);
  console.log(packages);
  var config = {
    map: map,
    packages: packages
  };
  System.config(config);
})(this);
