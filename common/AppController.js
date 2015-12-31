Aria.classDefinition({
    $classpath : "common.AppController",
    $extends : "aria.templates.ModuleCtrl",
    $implements : ["common.IAppController"],
    $dependencies : ["aria.utils.Json"],
    $constructor : function () {
        // call parent constructor
        this.$ModuleCtrl.constructor.call(this);
    },
    $destructor : function () {
        this.$ModuleCtrl.$destructor.call(this);
    },
    $prototype : {
        // specify the public interface for this module
        $publicInterfaceName : "common.IAppController",

        init : function(args, cb) {
            this.$logDebug("App controller initialized");

            // Keep going
            this.$callback(cb);
        }
    }
});