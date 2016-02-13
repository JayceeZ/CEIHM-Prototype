Aria.classDefinition({
  $classpath: "app.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.IController"],
  $dependencies: ["aria.utils.Json"],

  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.$constructor.call(this);

    this.modules = [];
    this.setData({
      wall: {
        name: "",
        id: null
      }
    });
  },
  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },

  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.IController",

    init: function(args, cb) {
      this.$logDebug("Init");

      // Walls list module
      this.modules.push({
        id: "walllist",
        view: "app.modules.walllist.views.List",
        ctrl: "app.modules.walllist.Controller"
      });
      // Stickywall module
      this.modules.push({
        id: "stickywall",
        view: "app.modules.stickywall.views.Wall",
        ctrl: "app.modules.stickywall.Controller"
      });

      this.$callback(cb);

      this.loadModule("walllist");
    },

    loadModule: function(id) {
      var module = _.find(this.modules, {id: id});

      this.$raiseEvent({
        name: "app.submodule.load",
        id: module.id,
        view: module.view,
        ctrl: module.ctrl,
        parentCtrl: this
      });
    },

    loadWall: function(id) {
      this.$logDebug('Loading wall '+id);
      this._data.wall.id = id;
      this.$raiseEvent({
        name: "app.submodule.load",
        id: this.modules[1].id,
        view: this.modules[1].view,
        ctrl: this.modules[1].ctrl,
        parentCtrl: this
      });
    },

    onModuleEvent : function(event) {
      this.$logDebug('Module event' + event);
    }
  }
});