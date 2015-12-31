Aria.classDefinition({
  $classpath: "app.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.IController"],
  $dependencies: ["aria.utils.Json"],
  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.constructor.call(this);

    this._data.waitingModules = 0;
  },
  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },
  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.IController",

    init: function(args, cb) {
      this.$logDebug("App controller initialized");

      this.__initSubModules(args, cb);
    },

    __initSubModules: function(args, cb) {
      var nextIndex = this.getData().waitingModules.length;
      this.loadSubModules(
        [{
          classpath: "app.modules.stickywall.Controller",
          refpath: "counters",
          arrayIndex: nextIndex
        }],
        {
          fn: this.onSubModuleLoaded,
          args: cb
        });
      this._data.waitingModules++;
    },

    onSubModuleLoaded: function(loadResult, cb) {
      this._data.waitingModules--;
      if (this._data.waitingModules === 0) {
        // Keep going
        this.$callback(cb);
      }
    }
  }
});