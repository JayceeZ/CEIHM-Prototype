Aria.classDefinition({
  $classpath: "app.modules.stickywall.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.modules.stickywall.IController"],

  $dependencies: [ //
    "aria.utils.Json", //
    "app.modules.stickywall.utils.PostitUtil", //
    "app.modules.stickywall.beans.PostitBean"
  ],

  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.constructor.call(this);

    // Utils
    this.$postitUtil = app.modules.stickywall.utils.PostitUtil;

    // Post-it related stuff
    this.__postits = [];
  },

  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },

  $statics : {
    "INVALID_POSTIT": "Post-it %1 does not respect Bean structure"
  },

  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.modules.stickywall.IController",

    init: function(args, cb) {
      this.$logDebug("Init");

      this.addPostit(0, this.$postitUtil._createEmptyPostit());
      this.addPostit(1, this.$postitUtil._createEmptyPostit());
      this.addPostit(2, this.$postitUtil._createEmptyPostit());

      // Keep going
      this.$callback(cb);
    },

    addPostit : function(id, postit) {
      try {
        aria.core.JsonValidator.normalize({
          json : postit,
          beanName : "app.modules.stickywall.beans.PostitBean.Postit"
        }, true);
      } catch (ex) {
        // The postit object does not match the bean
        this.$logError(this.INVALID_POSTIT, [id]);
        return;
      }
      this.__postits[id] = postit;
    },

    getPostits : function() {
      return this.__postits;
    }

  }
});