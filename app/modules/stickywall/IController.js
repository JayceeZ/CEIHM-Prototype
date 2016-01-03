Aria.interfaceDefinition({
  $classpath: "app.modules.stickywall.IController",
  $extends: 'aria.templates.IModuleCtrl',
  $events : {
    'app.module.stickywall.wall.loaded' : 'Raised when the stickywall controller have loaded a wall',
    'app.module.stickywall.wall.postit.updated' : 'Raised when a postit have been updated'
  },
  $interface: {
    getPostits: function() {},
    updatePostit: function(id, name, content, x, y) {}
  }
});