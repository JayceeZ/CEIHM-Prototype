Aria.interfaceDefinition({
  $classpath: "app.modules.stickywall.IController",
  $extends: 'aria.templates.IModuleCtrl',
  $events : {
    'app.module.stickywall.wall.loaded' : 'Raised when the stickywall controller have loaded a wall',
    'app.module.stickywall.wall.postit.created' : 'Raised when a postit have been created',
    'app.module.stickywall.wall.postit.updated' : 'Raised when a postit have been updated',
    'app.module.stickywall.wall.postit.removed' : 'Raised when a postit have been removed'
  },
  $interface: {
    loadWall: function(id) {},
    getWallName: function() {},
    getPostits: function() {},
    updatePostit: function(id, name, content, file, x, y) {},
    addPostit: function(id, postit) {},
    deletePostit: function(id) {}
  }
});