Aria.tplScriptDefinition({
  $classpath: 'app.modules.walllist.views.ListScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.Event', 'aria.core.IO'],

  $constructor: function() {
    this.model = {
      name: "",
      walls: [],
      createDialog: false
    };
  },

  $prototype: {
    $dataReady: function() {
      this.moduleCtrl.setData(this.data);
      this.moduleCtrl.loadWallsList();
    },

    wallItemAttributes: function(item) {
      return {
        classList: ["list-group-item"]
      };
    },

    loadWall: function(evt, args) {
      this.$logDebug("Requested wall "+args[0]);
      this.moduleCtrl.loadWall(args[0]);
    },

    onValidateName: function() {
      this.$json.setValue(this.model, "createDialog", false);
      this.moduleCtrl.createNewWall(this.model.name);
      this.$json.setValue(this.model, "name", "");
    },

    askForName: function() {
      // popup for name
      this.$json.setValue(this.model, "createDialog", true);
    },

    __setWalls: function(walls) {
      this.$json.setValue(this.model, "walls", walls);
    },

    onModuleEvent: function(evt) {
      if (evt.name === 'app.module.walllist.loaded') {
        this.__setWalls(evt.walls);
      } else if (evt.name === 'app.module.walllist.nowalls') {
        this.askForName();
      }
    }
  }
});