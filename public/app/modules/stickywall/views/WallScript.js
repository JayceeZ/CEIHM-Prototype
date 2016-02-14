Aria.tplScriptDefinition({
  $classpath: 'app.modules.stickywall.views.WallScript',
  $dependencies: ['aria.utils.Json', 'aria.utils.Event', 'aria.core.IO'],

  $constructor: function () {
    this.wallOrig = {x: 0, y: 0};
    this.wallMove = false;
    this.postitMove = false;
    this.justSelected = false;

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
        },
        size: {
          width: 100,
          height: 100
        }
      },
      wallScale: 1.0,
      createDialog: false,
      hideActions: false
    };
    this.selectedPostits = [];
    this.selectionPoint = {x: 0, y: 0};
    this.loopTouchEvents = null;
  },

  $prototype: {
    $dataReady: function () {
      this.moduleCtrl.setData(this.data);
      this.moduleCtrl.loadWall(this.data.parentData.wall.id);
      this.model.name = this.moduleCtrl.getWallName();
      this.__extractPostits();
    },

    setActionsVisible: function (boolean) {
      this.$json.setValue(this.model, "hideActions", !boolean);
    },

    /**
     * Drawing attributes
     * @param child
     * @returns {{classList: string[], style: string}}
     */
    postitAttributes: function (child) {
      var postit = child.item;
      var posX = postit.position.x + this.wallOrig.x;
      var posY = postit.position.y + this.wallOrig.y;
      var posZ = postit.position.z || 0;

      return {
        classList: ["postit"],
        style: "left: " + posX + "px; top: " + posY + "px; z-index: " + posZ + ";"
      };
    },

    onZoomOut : function() {
      var wallDOM = document.getElementsByClassName("wall")[0];
      var newScale = this.model.wallScale;
      if(newScale > 0.1)
       newScale -= 0.1;
      this.$json.setValue(this.model, "wallScale", newScale);
      wallDOM.style = "transform: scale("+newScale+");";
    },

    onZoomIn : function() {
      var wallDOM = document.getElementsByClassName("wall")[0];
      var newScale = this.model.wallScale;
      if(newScale < 1.0)
        newScale += 0.1;
      this.$json.setValue(this.model, "wallScale", newScale);
      wallDOM.style = "transform: scale("+newScale+");";
    },

    onPostitMouseDown: function (evt, child) {
      this.$logDebug("MouseDown Postit " + child.index);

      evt.preventDefault(true);
      if (!this.selectedPostits[child.index] || this.selectedPostits[child.index] === null) {
        // un nouveau postit selectionné
        this.$logDebug('Post-it ' + child.index + ' selected');
        this.selectedPostits[child.index] = child.item;
        this.justSelected = true;
      }
      // stocke le point de prise sur le post-it
      this.selectionPoint = {x: evt.clientX, y: evt.clientY};

      this.setActionsVisible(false);
      this._refreshPostit(child.index);
    },

    onPostitMouseUp: function (evt, child) {
      this.$logDebug("MouseUp Postit " + child.index);

      if (!this.justSelected && !this.postitMove) {
        // déselection
        this.$logDebug('Post-it ' + child.index + ' unselected');
        this.selectedPostits.splice(child.index, 1);
        this.__saveSize(child.item, evt.target, child.index);
        this._refreshPostit(child.index);
      } else {
        // fin déplacement post-it
        this.postitMove = false;
        this.saveWall(child.index);
      }
      this.selectionPoint = false;
      this.justSelected = false;
      this.setActionsVisible(true);
    },

    __saveSize: function (postit, target, index) {
      if (target) {
        var style = target.getAttribute("style");

        var regex = /([\w-]*)\s*:\s*([^;]*)/g;
        var match, properties = {};
        while (match = regex.exec(style)) properties[match[1]] = match[2];

        var widthStr = properties["width"];
        var width = Number(widthStr.slice(0, -2));
        var heightStr = properties["height"];
        var height = Number(heightStr.slice(0, -2));
        postit.size = {
          width: width,
          height: height
        }
        this.saveWall(index);
      }
    },

    onPostitUpClick: function (evt, child) {
      evt.preventDefault(true);
      var postit = child.item;
      if (postit.position.z || postit.position.z === 0) {
        if (postit.position.z < this.model.postits.length)
          postit.position.z++;
      } else
        postit.position.z = 1;
      this._refreshPostit(child.index);
      this.saveWall(child.index);
    },

    onPostitDownClick: function (evt, child) {
      evt.preventDefault(true);
      var postit = child.item;
      if (postit.position.z && postit.position.z > 0)
        postit.position.z--;
      else
        postit.position.z = 0;
      this._refreshPostit(child.index);
      this.saveWall(child.index);
    },

    onWallMouseDown: function (evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      // Wall interactions
      this.wallMove = {x: evt.clientX, y: evt.clientY};
      if (this.selectedPostits.length > 0) {
        this.$logDebug("Unselect post-its");
        var selected = this.selectedPostits;
        this.selectedPostits = [];
        _.forEach(selected, function (postit, i) {
          if (postit && postit != null)
            this._refreshPostit(i);
        }, this);
      }
      this.setActionsVisible(false);
    },

    onWallMouseMove: function (evt) {
      this.$logDebug("MouseMove Wall");
      evt.preventDefault(true);
      if (this.selectionPoint && this.selectedPostits.length > 0) {
        // déplacer les post-its selectionnés
        _.forEach(this.selectedPostits, function (ign, i) {
          if (ign) {
            var postit = this.model.postits[i];
            if (postit && postit !== null) {
              // move positions
              postit.position.x += evt.clientX - this.selectionPoint.x;
              postit.position.y += evt.clientY - this.selectionPoint.y;

              this._refreshPostitPositionStyle(i);
              this.saveWall(i);
            }
          }
        }, this);
        this.selectionPoint = {x: evt.clientX, y: evt.clientY};
        this.postitMove = true;
      } else if (this.wallMove) {
        // déplacer le wall
        this.moveWall(evt.clientX - this.wallMove.x, evt.clientY - this.wallMove.y);
        this.wallMove.x = evt.clientX;
        this.wallMove.y = evt.clientY;
      }
    },

    onWallMouseUp: function (evt) {
      this.$logDebug("MouseDown Wall");
      evt.preventDefault(true);
      this.wallMove = false;
      this.setActionsVisible(true);
    },

    onPostitTouchStart: function (evt, child) {
      this.$logDebug("TouchStart Postit");
      evt.preventDefault(true);

      // stocke le point de prise sur le post-it
      this.selectionPoint = {x: evt.touches[0].clientX, y: evt.touches[0].clientY};
      this.postitMove = false;
      this.setActionsVisible(false);
    },

    onPostitTouchMove: function (evt) {
      this.$logDebug("TouchMove Postit");
      evt.preventDefault(true);

      // déplacer les post-its selectionnés
      _.forEach(this.selectedPostits, function (ign, i) {
        if (ign) {
          var postit = this.model.postits[i];
          if (postit && postit !== null) {
            // move positions
            postit.position.x += evt.touches[0].clientX - this.selectionPoint.x;
            postit.position.y += evt.touches[0].clientY - this.selectionPoint.y;

            this._refreshPostitPositionStyle(i);
            this.saveWall(i);
          }
        }
      }, this);
      this.selectionPoint = {x: evt.touches[0].clientX, y: evt.touches[0].clientY};
      this.postitMove = true;
    },
    onPostitTouchEnd: function (evt, child) {
      this.$logDebug("TouchEnd Postit");
      evt.preventDefault(true);

      if (!this.selectedPostits[child.index] || this.selectedPostits[child.index] === null) {
        // un nouveau postit selectionné
        this.$logDebug('Post-it ' + child.index + ' selected');
        this.selectedPostits[child.index] = child.item;
      } else if (!this.postitMove) {
        // déselection
        this.$logDebug('Post-it ' + child.index + ' unselected');
        this.selectedPostits[child.index] = undefined;
      }
      this._refreshPostit(child.index);
      this.setActionsVisible(true);
    },

    onWallTouchStart: function (evt) {
      this.$logDebug("TouchStart Wall");
      evt.preventDefault(true);
      // Unselections
      if (this.selectedPostits.length > 0) {
        this.$logDebug("Unselect post-its");
        var selected = this.selectedPostits;
        this.selectedPostits = [];
        _.forEach(selected, function (postit, i) {
          if (postit && postit != null)
            this._refreshPostit(i);
        }, this);
      }
      // Wall interactions
      this.wallMove = {x: evt.touches[0].clientX, y: evt.touches[0].clientY};
      this.setActionsVisible(false);
    },

    onWallTouchMove: function (evt) {
      this.$logDebug("TouchMove Wall");
      evt.preventDefault(true);

      if (this.wallMove) {
        // déplacer le wall
        this.moveWall(evt.touches[0].clientX - this.wallMove.x, evt.touches[0].clientY - this.wallMove.y);
        this.wallMove.x = evt.touches[0].clientX;
        this.wallMove.y = evt.touches[0].clientY;
      }
    },

    onWallTouchEnd: function (evt) {
      this.$logDebug("TouchEnd Wall");
      if (!this.noWallTouch)
        return;

      this.wallMove = false;
      this.setActionsVisible(true);
    },

    _refreshPostitPositionStyle: function (id) {
      var draggablePostit = document.getElementById("postit-" + id);
      var postitDOM = draggablePostit.parentNode;
      var postit = this.model.postits[id];

      var posX = postit.position.x + this.wallOrig.x;
      var posY = postit.position.y + this.wallOrig.y;

      postitDOM.style.left = posX + "px";
      postitDOM.style.top = posY + "px";
    },

    _refreshPostit: function (id, data) {
      var postit = this.model.postits[id];
      if (data)
        postit = data;

      this.$json.removeAt(this.model.postits, id);
      this.$json.add(this.model.postits, postit, id);
    },

    _addPostit: function (id, data) {
      this.$json.add(this.model.postits, data, id);
    },

    _removePostit: function (id) {
      this.$json.removeAt(this.model.postits, id);
    },

    moveWall: function (dx, dy) {
      this.$json.setValue(this.wallOrig, "x", this.wallOrig.x + dx);
      this.$json.setValue(this.wallOrig, "y", this.wallOrig.y + dy);
      for (var i = 0; i < this.model.postits.length; i++) {
        this._refreshPostitPositionStyle(i);
      }
    },

    onCreatePostit: function (evt) {
      this.model.postitToEdit.position.x = this.wallOrig.x + window.innerWidth / 2;
      this.model.postitToEdit.position.y = this.wallOrig.y + window.innerHeight / 2;
      aria.utils.Json.setValue(this.model, 'createDialog', true);
    },

    onValidateCreatePostit: function (evt) {
      var postit = {
        name: this.model.postitToEdit.name,
        content: this.model.postitToEdit.content,
        file: this.model.postitToEdit.associatedFile,
        position: {
          x: Math.floor(this.model.postitToEdit.position.x),
          y: Math.floor(this.model.postitToEdit.position.y)
        },
        size: {
          width: this.model.postitToEdit.size.width,
          height:  this.model.postitToEdit.size.height
        }
      };
      this.model.postitToEdit.name = "";
      this.model.postitToEdit.content = "";
      this.model.postitToEdit.associatedFile = "";
      this.$json.setValue(this.model, 'createDialog', false);
      this.moduleCtrl.addPostit(postit);
    },

    onDeletePostit: function (evt) {
      _.forEach(this.selectedPostits, function (ign, i) {
        if (ign)
          this.moduleCtrl.deletePostit(i);
      }, this);
      this.selectedPostits = [];
    },

    saveWall: function (index) {
      if (index || index === 0) {
        // the postit is saved
        var postit = this.model.postits[index];
        this.__savePostit(index, postit);
      } else {
        // everything is saved
        _.forEach(this.model.postits, function (postit, id) {
          this.__savePostit(id, postit);
        }, this);
      }
    },

    __savePostit: function (id, postit) {
      var width = 0, height = 0;
      if (postit.size) {
        width = postit.size.width;
        height = postit.size.height;
      }
      this.moduleCtrl.updatePostit(id, postit.name, postit.content, postit.file, postit.position.x, postit.position.y, postit.position.z, width, height);
    },

    isSelected: function (index) {
      return (this.selectedPostits[index] && this.selectedPostits[index] !== null);
    },

    onImportFile: function () {
      var fileInput = aria.utils.Dom.getElementById("fileUpload");
      fileInput.click();
    },

    onFileChosen: function () {
      var url = "/api/file";
      // simulate async request to submit form
      aria.core.IO.asyncFormSubmit({
        url: url,
        method: "POST",
        formId: "formSubmit",
        expectedResponseType: 'json',
        callback: {
          fn: this.onFileUploadSuccess,
          onerror: this.onFileUploadError,
          scope: this
        }
      });
    },

    onFileUploadSuccess: function (res) {
      var rep = res.responseJSON;
      this.$logDebug('File uploaded at ' + rep.url);
      this.model.postitToEdit.associatedFile = rep.url;
    },

    onFileUploadError: function (res) {
      this.$logDebug('File upload error');
    },

    onModuleEvent: function (evt) {
      if (evt.name === 'app.module.stickywall.wall.loaded') {
        this.__extractPostits();
      }
      if (evt.name === 'app.module.stickywall.wall.postit.updated') {
        console.log("Update received");
        this._refreshPostit(evt.id, evt.postit);
      }
      if (evt.name === 'app.module.stickywall.wall.postit.created') {
        this._addPostit(evt.id, evt.postit);
      }
      if (evt.name === 'app.module.stickywall.wall.postit.removed') {
        this._removePostit(evt.id);
      }
    },

    __extractPostits: function () {
      this.$json.setValue(this.model, "postits", this.moduleCtrl.getPostits());
    }
  }
});