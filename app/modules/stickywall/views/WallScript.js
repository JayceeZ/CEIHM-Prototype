Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.WallScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.dragdrop.Drag'],

  $constructor: function() {
    this.wallOrig = {x: 0, y: 0};
    this.wallMove = false;

    this.model = {
      postits: []
    };
    this.selectedPostit = null;
    this.selectionPoint = {x: 0, y: 0};
  },

  $prototype: {
    $dataReady: function() {
      this.__extractPostits();
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
          this._updatePostit(exSelect);
        this._updatePostit(child.index);
      } else {
        this.selectedPostit = null;
        this._updatePostit(child.index);
        this.onWallSave();
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
          this._updatePostit(exSelect);
        this._updatePostit(child.index);
      } else {
        this.selectedPostit = null;
        this._updatePostit(child.index);
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

    _updatePostit : function(id, data) {
      // refresh in repeater

      var postit = this.model.postits[id];
      if(data)
        var postit = data;

      this.$json.removeAt(this.model.postits, id);
      this.$json.add(this.model.postits, postit, id);
    },

    moveWall: function(dx, dy) {
      this.wallOrig.x += dx;
      this.wallOrig.y += dy;
      for (var i = 0; i < this.model.postits.length; i++) {
        var postit = this.model.postits[i];
        //postit.position.x += dx;
        //postit.position.y += dy;
        this._updatePostit(i);
      }
    },

    onWallSave : function(evt) {
      for (var id = 0; id < this.model.postits.length; id++) {
        var postit = this.model.postits[id];
        this.moduleCtrl.updatePostit(id, postit.name, postit.content, postit.position.x, postit.position.y);
      }
    },

    onWallMouseMove: function(evt) {
      this.$logDebug("MouseMove Wall");
      evt.preventDefault(true);
      if (this.selectedPostit !== null) {
        var postit = this.model.postits[this.selectedPostit];

        // move positions
        postit.position.x = evt.clientX - this.selectionPoint.x;
        postit.position.y = evt.clientY - this.selectionPoint.y;

        this._updatePostit(this.selectedPostit);
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
        var postit = this.model.postits[this.selectedPostit];

        // move positions
        postit.position.x = evt.touches[0].clientX - this.selectionPoint.x;
        postit.position.y = evt.touches[0].clientY - this.selectionPoint.y;

        this._updatePostit(this.selectedPostit, evt);

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
        this._updatePostit(exSelect);
      }
      this.wallMove = false;
    },

    onModuleEvent: function(evt) {
      if (evt.name === 'app.module.stickywall.wall.loaded') {
        this.__extractPostits();
      }
      if (evt.name === 'app.module.stickywall.wall.postit.updated') {
        this._updatePostit(evt.id, evt.postit);
      }
    },

    __extractPostits : function() {
      this.$json.setValue(this.model, "postits", this.moduleCtrl.getPostits());
    }
  }
});