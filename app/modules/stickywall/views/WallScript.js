Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.WallScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.dragdrop.Drag'],

  $constructor: function() {
    this.wallOrig = {x: 0, y: 0};
    this.wallMove = false;

    this.postits = [];
    this.selectedPostit = null;
    this.selectionPoint = {x: 0, y: 0};
  },

  $prototype: {
    $dataReady: function() {
      this.postits = this.moduleCtrl.getPostits();
    },

    /**
     * Drawing attributes
     * @param child
     * @returns {{classList: string[], style: string}}
     */
    postitAttributes: function(child) {
      var postit = child.item;
      var posX = postit.position.x;
      var posY = postit.position.y;
      return {
        classList: ["postit"],
        style: "left: " + posX + "px; top: " + posY + "px;"
      };
    },

    onPostitMouseDown: function(evt, child) {
      this.$logDebug("MouseDown Postit");
      evt.preventDefault(true);
      if (this.selectedPostit !== child.index) {
        // un nouveau postit
        var exSelect = this.selectedPostit;
        this.selectedPostit = child.index;
        this.selectionPoint.x = evt.clientX - child.item.position.x;
        this.selectionPoint.y = evt.clientY - child.item.position.y;

        if (exSelect)
          this.updatePostit(exSelect);
        this.updatePostit(child.index);
      } else {
        this.selectedPostit = null;
        this.updatePostit(child.index);
      }
    },

    onPostitTouchStart: function(evt, child) {
      this.$logDebug("TouchStart Postit");
      evt.preventDefault(true);
      if (this.selectedPostit !== child.index) {
        var exSelect = this.selectedPostit;
        this.selectedPostit = child.index;

        this.selectionPoint.x = evt.touches[0].clientX - child.item.position.x;
        this.selectionPoint.y = evt.touches[0].clientY - child.item.position.y;

        if (exSelect)
          this.updatePostit(exSelect);
        this.updatePostit(child.index);
      } else {
        this.selectedPostit = null;
        this.updatePostit(child.index);
      }
    },

    onWallMouseDown : function(evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      // Wall interactions
      this.wallMove = {x: evt.clientX, y: evt.clientY};
    },

    onWallMouseUp : function(evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      // Wall interactions
      this.wallMove = false;
    },

    updatePostit : function(id, evt) {
      // refresh in repeater
      var postit = this.postits[id];

      this.$json.removeAt(this.postits, id);
      this.$json.add(this.postits, postit, id);

      // TODO: fix the TouchMove loss
    },

    moveWall: function(dx, dy) {
      for (var i = 0; i < this.postits.length; i++) {
        var postit = this.postits[i];
        postit.position.x += dx;
        postit.position.y += dy;
        this.updatePostit(i);
      }
    },

    onWallMouseMove: function(evt) {
      this.$logDebug("MouseMove Wall");
      evt.preventDefault(true);
      if (this.selectedPostit !== null) {
        var postit = this.postits[this.selectedPostit];

        // move positions
        postit.position.x = evt.clientX - this.selectionPoint.x;
        postit.position.y = evt.clientY - this.selectionPoint.y;

        this.updatePostit(this.selectedPostit);
      } else if(this.wallMove) {
        this.moveWall(evt.clientX - this.wallMove.x, evt.clientY - this.wallMove.y);
        this.wallMove.x = evt.clientX;
        this.wallMove.y = evt.clientY;
      }
    },

    onWallTouchStart : function(evt) {
      this.$logDebug("TouchStart Wall");
      evt.preventDefault(true);
      // Wall interactions
      this.wallMove = {x: evt.touches[0].clientX, y: evt.touches[0].clientY};
    },

    onWallTouchMove: function(evt) {
      this.$logDebug("TouchMove Wall");
      evt.preventDefault(true);
      if (this.selectedPostit !== null) {
        var postit = this.postits[this.selectedPostit];

        // move positions
        postit.position.x = evt.touches[0].clientX - this.selectionPoint.x;
        postit.position.y = evt.touches[0].clientY - this.selectionPoint.y;

        this.updatePostit(this.selectedPostit, evt);

      } else if(this.wallMove) {
        this.moveWall(evt.touches[0].clientX - this.wallMove.x, evt.touches[0].clientY - this.wallMove.y);
        this.wallMove.x = evt.touches[0].clientX;
        this.wallMove.y = evt.touches[0].clientY;
      }
    },

    onWallTouchEnd: function(evt) {
      this.$logDebug("TouchEnd Wall");
      if (this.selectedPostit !== null) {
        var exSelect = this.selectedPostit;
        this.selectedPostit = null;
        this.updatePostit(exSelect);
      }
      this.wallMove = false;
    },

    onModuleEvent: function(evt) {
      if (evt.name === "app.{somename}") {
        // perform some actions on the view
      }
    }
  }
});