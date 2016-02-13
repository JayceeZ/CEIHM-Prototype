Aria.tplScriptDefinition({
  $classpath: 'app.views.MainScript',
  $dependencies: ['aria.utils.Json'],

  $constructor: function() {
    this.model = {
      moduleLoadedId: ""
    };
  },

  $prototype: {
    $dataReady : function() {
    },

    loadSubModule : function(templateRef, controllerRef, controllerParent) {
      Aria.loadTemplate({
        classpath: templateRef,
        div: "submodule",
        moduleCtrl: {
          classpath: controllerRef
        },
        data: {
          parentData: controllerParent._data,
          parentCtrl: controllerParent
        }
      });
    },

    loadModule: function(evt, id) {
      this.$logDebug('Requested module '+ id);
    },

    isActive: function(moduleid) {
      return moduleid === this.model.moduleLoadedId;
    },

    __setLoadedId : function(id) {
      this.$json.setValue(this.model, "moduleLoadedId", id);
    },

    onModuleEvent: function(evt) {
      if (evt.name === "app.submodule.load") {
        this.__setLoadedId(evt.id);
        this.loadSubModule(evt.view, evt.ctrl, evt.parentCtrl);
      }
    }
  }
});