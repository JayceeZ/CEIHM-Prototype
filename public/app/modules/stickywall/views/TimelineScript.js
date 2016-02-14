/**
 * Created by Jc on 14/02/2016.
 */
Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.TimelineScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.Event', 'aria.core.IO'],

  $constructor: function () {
    this.model = {
      wallCreation: new Date(),
      wallMarks: []
    };
  },

  $prototype: {
    $dataReady: function () {
      this.model.wallCreation = this.moduleCtrl.getWallDate();
      this.moduleCtrl.loadMarks();
    },

    getMarkAttributes: function(child) {
      var mark = child.item;
      var startTimeline = new Date(this.model.wallCreation).getTime();
      var totalTimeline = new Date() - startTimeline;
      var markTime = new Date(mark.date).getTime();
      var posX =  (markTime - startTimeline) / totalTimeline;

      var wall = document.getElementsByClassName("wall")[0];
      var wallWidth = wall.clientWidth;
      return {
        classList: ["mark"],
        style: "left: "+ (posX * wallWidth) +"px;"
      };
    },

    setMarkups: function(markups) {
      this.$json.setValue(this.model, "wallMarks", markups);
    },

    onModuleEvent: function (evt) {
      this.$logDebug('Received event '+evt.name);
      if (evt.name === 'app.module.stickywall.wall.marks.updated') {
        this.setMarkups(evt.marks);
      }
    }
  }
});