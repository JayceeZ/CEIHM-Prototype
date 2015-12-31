Aria.classDefinition({
  $classpath: "app.modules.stickywall.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.modules.stickywall.IController"],
  $dependencies: ["aria.utils.Json"],
  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.constructor.call(this);
  },
  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },
  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.modules.stickywall.IController",

    init: function(args, cb) {
      this.$logDebug("Stickywall controller initialized");

      // Keep going
      this.$callback(cb);
    }
  }
});