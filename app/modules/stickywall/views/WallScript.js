Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.WallScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.dragdrop.Drag'],

  $constructor: function() {
    this.postits = [];
    this.selectedPostit = null;
    this.selectionPoint = {x: 0, y: 0};
  },

  $prototype: {
    $dataReady: function() {
      this.postits = this.moduleCtrl.getPostits();
    },

    postitAttributes : function(child) {
      var postit = child.item;
      return {
        classList : ["postit"],
        style: "left: "+postit.position.x+"px; top: "+postit.position.y+"px;"
      };
    },

    onPostitClick : function(evt, child) {
      if(this.selectedPostit === null) {
        this.selectedPostit = child.index;
        this.selectionPoint.x = evt.clientX - child.item.position.x;
        this.selectionPoint.y = evt.clientY - child.item.position.y;
        this.updatePostit(child.index);
      } else {
        this.selectedPostit = null;
        this.updatePostit(child.index);
      }
    },

    onWallMouseClick : function(evt) {
      // Wall interactions
    },

    updatePostit : function(id) {
      // refresh in repeater
      var postit = this.postits[id];
      this.$json.removeAt(this.postits, id);
      this.$json.add(this.postits, postit, id);
    },

    onWallMouseMove : function(evt) {
      if(this.selectedPostit === null)
        return;
      var postit = this.postits[this.selectedPostit];

      // move positions
      postit.position.x = (evt.clientX - this.selectionPoint.x);
      postit.position.y = (evt.clientY - this.selectionPoint.y);

      this.updatePostit(this.selectedPostit);
    },

    onModuleEvent: function(evt) {
      if (evt.name === "app.{somename}") {
        // perform some actions on the view
      }
    }
  }
});