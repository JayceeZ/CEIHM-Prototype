Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.WallScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.Event'],

  $constructor: function() {
    this.wallOrig = {x: 0, y: 0};
    this.wallMove = false;
    this.mouseDown = false;

    this.model = {
      name: "",
      postits: [],
      postitToEdit: {
        name: "",
        content: "",
        position: {
          x: 20,
          y: 20,
          z: 0
        }
      },
      createDialog: false
    };
    this.selectedPostit = null;
    this.selectionPoint = {x: 0, y: 0};
  },

  $prototype: {
    $dataReady: function() {
      this.model.name = this.moduleCtrl.getWallName();
      this.__extractPostits();
    },

    /**
     * Drawing attributes
     * @param child
     * @returns {{classList: string[], style: string}}
     */
    postitAttributes: function(child) {
      var postit = child.item;
      var posX = postit.position.x + this.wallOrig.x;
      var posY = postit.position.y + this.wallOrig.y;
      var posZ = postit.position.z;
      return {
        classList: ["postit"],
        style: "left: " + posX + "px; top: " + posY + "px; z-index: "+posZ
      };
    },

    onPostitMouseDown: function(evt, child) {
      this.$logDebug("MouseDown Postit");
      evt.preventDefault(true);
      this.mouseDown = true;
      if (this.selectedPostit !== child.index) {
        // un nouveau postit
        var exSelect = this.selectedPostit;
        this.selectedPostit = child.index;
        this.selectionPoint.x = evt.clientX - child.item.position.x;
        this.selectionPoint.y = evt.clientY - child.item.position.y;

        if (exSelect)
          this._updatePostit(exSelect);
        this._updatePostit(child.index);
      }
    },

    onPostitMouseUp:  function(evt, child) {
      this.mouseDown = false;
      this.selectedPostit = null;
      this._updatePostit(child.index);
      this.saveWall(child.index);
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
        this.saveWall(child.index);
      }
    },

    onWallMouseDown: function(evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      // Wall interactions
      this.wallMove = {x: evt.clientX, y: evt.clientY};
      if (this.selectedPostit !== null) {
        var i = this.selectedPostit;
        this.selectedPostit = null;
        this._updatePostit(i);
        this.saveWall(i);
      }
    },

    onWallMouseUp: function(evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      // Wall interactions
      this.wallMove = false;
    },

    _updatePostit: function(id, data) {
      var postit = this.model.postits[id];
      if (data)
        postit = data;

      this.$json.removeAt(this.model.postits, id);
      this.$json.add(this.model.postits, postit, id);
    },

    _addPostit: function(id, data) {
      this.$json.add(this.model.postits, data, id);
    },

    _removePostit: function(id) {
      this.$json.removeAt(this.model.postits, id);
    },

    moveWall: function(dx, dy) {
      this.$json.setValue(this.wallOrig, "x", this.wallOrig.x+dx);
      this.$json.setValue(this.wallOrig, "y", this.wallOrig.y+dy);
      for (var i = 0; i < this.model.postits.length; i++) {
        this._updatePostit(i);
      }
    },

    onCreatePostit: function(evt) {
      this.model.postitToEdit.position.x = this.wallOrig.x+window.innerWidth/2;
      this.model.postitToEdit.position.y = this.wallOrig.y+window.innerHeight/2;
      aria.utils.Json.setValue(this.model, 'createDialog', true);
    },

    onValidateCreatePostit: function(evt) {
      var postit = {
        name: this.model.postitToEdit.name,
        content: this.model.postitToEdit.content,
        position: {
          x: Math.floor(this.model.postitToEdit.position.x),
          y: Math.floor(this.model.postitToEdit.position.y)
        }
      };
      this.$json.setValue(this.model, 'createDialog', false);
      this.moduleCtrl.addPostit(postit);
    },

    onDeletePostit : function (evt) {
      if(this.selectedPostit !== null)
        this.moduleCtrl.deletePostit(this.selectedPostit);
      this.selectedPostit = null;
    },

    saveWall: function(index) {
      if(index || index === 0) {
        // the postit is saved
        var postit = this.model.postits[index];
        this.moduleCtrl.updatePostit(index, postit.name, postit.content, postit.position.x, postit.position.y);
      } else {
        // everything is saved
        _.forEach(this.model.postits, function (postit, id) {
          this.moduleCtrl.updatePostit(id, postit.name, postit.content, postit.position.x, postit.position.y);
        }, this);
      }
    },

    onWallMouseMove: function(evt) {
      this.$logDebug("MouseMove Wall");
      evt.preventDefault(true);
      if (this.selectedPostit !== null && this.mouseDown) {
        var postit = this.model.postits[this.selectedPostit];

        // move positions
        postit.position.x = evt.clientX - this.selectionPoint.x;
        postit.position.y = evt.clientY - this.selectionPoint.y;

        this._updatePostit(this.selectedPostit);
      } else if (this.wallMove) {
        this.moveWall(evt.clientX - this.wallMove.x, evt.clientY - this.wallMove.y);
        this.wallMove.x = evt.clientX;
        this.wallMove.y = evt.clientY;
      }
    },

    onWallTouchStart: function(evt) {
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

        this._updatePostit(this.selectedPostit);

      } else if (this.wallMove) {
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
      this.saveWall();
    },

    onModuleEvent: function(evt) {
      if (evt.name === 'app.module.stickywall.wall.loaded') {
        this.__extractPostits();
      }
      if (evt.name === 'app.module.stickywall.wall.postit.updated') {
        this._updatePostit(evt.id, evt.postit);
      }
      if (evt.name === 'app.module.stickywall.wall.postit.created') {
        this._addPostit(evt.id, evt.postit);
      }
      if (evt.name === 'app.module.stickywall.wall.postit.removed') {
        this._removePostit(evt.id);
      }
    },

    __extractPostits: function() {
      this.$json.setValue(this.model, "postits", this.moduleCtrl.getPostits());
    }
  }
});