Aria.tplScriptDefinition({
  $classpath: 'app.modules.walllist.views.ListScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.Event', 'aria.core.IO'],

  $constructor: function() {
    this.model = {
      walls: [{
        name: "No walls",
        postits: []
      }]
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

    __setWalls: function(walls) {
      this.$json.setValue(this.model, "walls", walls);
    },

    onModuleEvent: function(evt) {
      if (evt.name === 'app.module.walllist.loaded') {
        this.__setWalls(evt.walls);
      }
    }
  }
});