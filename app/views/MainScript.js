Aria.tplScriptDefinition({
  $classpath: 'app.views.MainScript',
  $dependencies: ['aria.utils.Json'],

  $constructor: function() {
    this.dataReady = false;
  },

  $prototype: {
    $dataReady : function() {
      this.$logDebug("DataReady Main");

      this.dataReady = true;
    },

    loadSubModule : function(templateRef, controllerRef) {
      Aria.loadTemplate({
        classpath: templateRef,
        div: "submodule",
        moduleCtrl: {
          classpath: controllerRef
        }
      });
    },

    onModuleEvent: function(evt) {
      if (evt.name === "app.submodule.load") {
        this.loadSubModule(evt.view, evt.ctrl);
      }
    }
  }
});