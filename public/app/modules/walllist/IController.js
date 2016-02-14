Aria.interfaceDefinition({
  $classpath: "app.modules.walllist.IController",
  $extends: 'aria.templates.IModuleCtrl',
  $events : {
    'app.module.walllist.loaded' : 'Raised when the list of walls have been loaded',
    'app.module.walllist.nowalls' : 'Raised when no wall is available',
    'app.module.stickywall.load': 'Raised when we want to load a wall'
   },
  $interface: {
    loadWallsList: function() {},
    loadWall: function(id) {},
    createNewWall: function(name) {}
  }
});