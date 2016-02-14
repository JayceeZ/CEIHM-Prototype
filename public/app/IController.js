Aria.interfaceDefinition({
  $classpath: "app.IController",
  $extends: 'aria.templates.IModuleCtrl',
  $events : {
    "app.submodule.load" : "Raised when a submodule templates wants to be loaded",
    'app.module.stickywall.wall.loaded' : 'Raised when the stickywall controller have loaded a wall'
  },
  $interface: {
    loadWall: function(id) {},
    loadModule: function(id) {},
    newWall: function() {}
  }
});