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

    onPostitMouseDown : function(evt, child) {
      this.$logDebug("MouseDown Postit");
      evt.preventDefault(true);
      if(this.selectedPostit !== child.index) {
        // un nouveau postit
        var exSelect = this.selectedPostit;
        this.selectedPostit = child.index;
        this.selectionPoint.x = evt.clientX - child.item.position.x;
        this.selectionPoint.y = evt.clientY - child.item.position.y;

        if(exSelect)
          this.updatePostit(exSelect);
        this.updatePostit(child.index);
      } else {
        this.selectedPostit = null;
        this.updatePostit(child.index);
      }
    },

    onPostitTap : function(evt, child) {
      this.$logDebug("TouchStart Postit");
      evt.preventDefault(true);
      if(this.selectedPostit !== child.index) {
        var exSelect = this.selectedPostit;
        this.selectedPostit = child.index;

        this.selectionPoint.x = evt.touches[0].clientX - child.item.position.x;
        this.selectionPoint.y = evt.touches[0].clientY - child.item.position.y;

        if(exSelect)
          this.updatePostit(exSelect);
      } else {
        this.selectedPostit = null;
        this.updatePostit(child.index);
      }
    },

    onWallMouseDown : function(evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      // Wall interactions
    },

    updatePostit : function(id, evt) {
      // refresh in repeater
      var postit = this.postits[id];

      this.$json.removeAt(this.postits, id);
      this.$json.add(this.postits, postit, id);

      // TODO: fix the TouchMove loss
    },

    onWallMouseMove : function(evt) {
      this.$logDebug("MouseMove Wall");
      evt.preventDefault(true);
      if(this.selectedPostit === null)
        return;
      var postit = this.postits[this.selectedPostit];

      // move positions
      postit.position.x = (evt.clientX - this.selectionPoint.x);
      postit.position.y = (evt.clientY - this.selectionPoint.y);

      this.updatePostit(this.selectedPostit);
    },

    onWallTouchMove : function(evt) {
      this.$logDebug("TouchMove Wall");
      evt.preventDefault(true);
      if(this.selectedPostit === null)
        return;
      var postit = this.postits[this.selectedPostit];

      // move positions
      postit.position.x = (evt.touches[0].clientX - this.selectionPoint.x);
      postit.position.y = (evt.touches[0].clientY - this.selectionPoint.y);

      this.updatePostit(this.selectedPostit, evt);
    },

    onWallTouchEnd : function(evt) {
      this.$logDebug("TouchEnd Wall");
      if(this.selectedPostit !== null) {
        var exSelect = this.selectedPostit;
        this.selectedPostit = null;
        this.updatePostit(exSelect);
      }
    },

    onModuleEvent: function(evt) {
      if (evt.name === "app.{somename}") {
        // perform some actions on the view
      }
    }
  }
});