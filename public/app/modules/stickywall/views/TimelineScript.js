/**
 * Created by Jc on 14/02/2016.
 */
Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.TimelineScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.Event', 'aria.core.IO'],

  $constructor: function () {
    this.model = {
      wall: {
        date: new Date("02-08-2016")
      },
      wallMarks: [
        {
          id: "trucmuche",
          date: new Date("02-10-2016")
        },
        {
          id: "autrechose",
          date: new Date("02-12-2016")
        },
        {
          id: "sachetdethe",
          date: new Date(new Date - new Date(40))
        }
      ]
    };
  },

  $prototype: {
    $dataReady: function () {
      //this.moduleCtrl.loadMarks();
    },

    getMarkAttributes: function(child) {
      var mark = child.item;
      var startTimeline = this.model.wall.date.getTime();
      var totalTimeline = new Date() - startTimeline;
      var markTime = mark.date.getTime();
      var posX =  (markTime - startTimeline) / totalTimeline;

      var wall = document.getElementsByClassName("wall")[0];
      var wallWidth = wall.clientWidth;
      return {
        classList: ["mark"],
        style: "left: "+ (posX * wallWidth) +"px;"
      };
    }
  }
});