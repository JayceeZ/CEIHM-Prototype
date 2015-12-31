Aria.classDefinition({
  $classpath: "app.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.IController"],
  $dependencies: ["aria.utils.Json"],

  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.constructor.call(this);

    this.setData({});
  },
  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },

  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.IController",

    init: function(args, cb) {
      this.$logDebug("App controller init");

      this.$callback(cb);

      this.$raiseEvent({
        name: "app.submodule.load",
        view: "app.modules.stickywall.views.Wall",
        ctrl: "app.modules.stickywall.Controller"
      });
    }
  }
});