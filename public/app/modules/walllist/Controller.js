Aria.classDefinition({
  $classpath: "app.modules.walllist.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.modules.walllist.IController"],

  $dependencies: [ //
    "aria.utils.Json" //
  ],

  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.$constructor.call(this);

  },

  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },

  $statics: {

  },

  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.modules.walllist.IController",

    init: function (args, cb) {
      this.$logDebug("Init");

      // Keep going
      this.$callback(cb);
    },

    loadWallsList: function() {
      this.$logDebug('Loading walls list');
      aria.core.IO.asyncRequest({
        url: "/api/walls/",
        method: "get",
        expectedResponseType: 'json',
        callback: {
          fn: this._onWallsListLoaded,
          scope: this
        }
      });
    },

    loadWall: function(id) {
      this._data.parentCtrl.loadWall(id);
    },

    _onWallsListLoaded: function(response) {
      var data = response.responseJSON;
      if(!data.walls || !data.walls.length) {
        this.$raiseEvent({
          name: "app.module.walllist.nowalls"
        });
      }
      if(data) {
        this.$raiseEvent({
          name: "app.module.walllist.loaded",
          walls: data.walls
        });
      }
    },

    createNewWall : function(name) {
      this._data.parentCtrl.newWall(name);
    },

    onModuleEvent: function (event) {
      if (event) {
        if (event.name === "") {

        }
      }
    }
  }
});