Aria.classDefinition({
  $classpath: "app.modules.stickywall.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.modules.stickywall.IController"],

  $dependencies: [ //
    "aria.utils.Json", //
    "app.modules.stickywall.beans.PostitBean"
  ],

  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.$constructor.call(this);

    // Wall
    this.wallSocket = null;
    this.storage = null;
    this.__wall = {name: "New wall", date: new Date(), postits: []};
    this._wallMarks = [];
  },

  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },

  $statics: {
    "INVALID_POSTIT": "Post-it %1 does not respect Bean structure"
  },

  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.modules.stickywall.IController",

    init: function(args, cb) {
      this.$logDebug("Init");

      // Keep going
      this.$callback(cb);
    },

    loadWall: function(id) {
      this._loadWall(id);
    },

    createMark: function() {
      aria.core.IO.asyncRequest({
        url: "/api/wall/" + this.__wall._id+"/markup",
        method: "post",
        expectedResponseType: 'json',
        callback: {
          fn: this.loadMarks,
          scope: this
        }
      });
    },

    addPostit: function(newPostit) {
      try {
        aria.core.JsonValidator.normalize({
          json: newPostit,
          beanName: "app.modules.stickywall.beans.PostitBean.Postit"
        }, true);
        this.__wall.postits.push(newPostit);
        if(this.wallSocket) {
          this.wallSocket.emit('new_postit', newPostit);
        }
      } catch (ex) {
        // The postit object does not match the bean
        this.$logError(this.INVALID_POSTIT, [newPostit.id]);
      }
    },

    deletePostit: function(id) {
      if(this.wallSocket) {
        this.wallSocket.emit('delete_postit', {id: id});
      }
    },

    updatePostit: function(id, name, content, file, x, y, z, w, h) {
      if(!id && id !== 0)
        return;
      if(name && name !== this.__wall.postits[id].name)
        this.__wall.postits[id].name = name;
      if(content && content !== this.__wall.postits[id].content) {
        this.__wall.postits[id].content = content;
        this.wallSocket.emit('update_postit_content', {id: id, content: content});
      }

      if(x && x !== this.__wall.postits[id].position.x)
        this.__wall.postits[id].position.x = x;
      if(y && y !== this.__wall.postits[id].position.y)
        this.__wall.postits[id].position.y = y;
      if(z && z !== this.__wall.postits[id].position.z)
        this.__wall.postits[id].position.z = z;
      if(this.wallSocket && (x || y || z))
        this.wallSocket.emit('update_postit_position', {id: id, position: {x: x, y: y, z: z}});

      if(!this.__wall.postits[id].size)
        this.__wall.postits[id].size = {x: undefined, y: undefined};
      if(w && w !== this.__wall.postits[id].size.width)
        this.__wall.postits[id].size.width = w;
      if(h && h !== this.__wall.postits[id].size.height)
        this.__wall.postits[id].size.height = h;
      if(this.wallSocket && (w || h)) {
        this.wallSocket.emit('update_postit_size', {id: id, size: {width: w, height: h}});
      }
     },

    loadMarks: function() {
      aria.core.IO.asyncRequest({
        url: "/api/wall/" + this.__wall._id+"/markups",
        method: "get",
        expectedResponseType: 'json',
        callback: {
          fn: this._onWallMarksLoaded,
          scope: this
        }
      });
    },

    _onWallMarksLoaded: function(data) {
      this._wallMarks = data.responseJSON;
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.marks.updated',
        marks: this._wallMarks
      });
    },

    getPostits: function() {
      return _.clone(this.__wall.postits, true);
    },

    getWallName: function() {
      return this.__wall.name;
    },

    __onSocketError : function(data) {
      var log = "Error on socket";
      if(data.hasOwnProperty("message"))
        log += ": "+data.message;
      else
        log += ": No details";
      console.log(log);
    },

    __registerWallSocket: function (wallId) {
      if (typeof io === 'undefined')
        return;
      this.wallSocket = io(':8001');
      this.wallSocket.emit('register_wall', {wallId: wallId});
      this.wallSocket.on('action_error', this.__onSocketError);
      this.wallSocket.on('disconnect', this.__onSocketDisconnect);
      this.wallSocket.on('wall_registered', function() {
        this.$logDebug('You are connected to the socket (LiveUpdates)');
      }.bind(this));
      this.wallSocket.on('postit_updated', this.__onPostitUpdated.bind(this));
      this.wallSocket.on('postit_added', this.__onPostitCreated.bind(this));
      this.wallSocket.on('postit_removed', this.__onPostitRemoved.bind(this));
    },

    _loadWall: function(id) {
      this.__registerWallSocket(id);
      aria.core.IO.asyncRequest({
        url: "/api/wall/" + id,
        method: "get",
        expectedResponseType: 'json',
        callback: {
          fn: this._onWallLoaded,
          scope: this
        }
      });
    },

    __onPostitUpdated : function(data) {
      this.$logDebug('Postit ('+data.id+') new data: '+data.postit);
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.postit.updated',
        id: data.id,
        postit: data.postit
      });
    },

    __onPostitCreated : function(data) {
      this.__wall.postits.push(data);
      this.$logDebug('New Postit '+this.__wall.postits.length);
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.postit.created',
        postit: data
      });
    },

    __onPostitRemoved : function(data) {
      this.$logDebug('Postit '+data.id+' removed');
      //_.pullAt(this.__wall.postits, data.id);
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.postit.removed',
        id: data.id
      });
    },

    _onWallLoaded: function(response, args) {
      this.__wall = response.responseJSON;
      if(this.validateWall(this.__wall)) {
        this.$logDebug('Wall id: ' + this.__wall._id + ' loaded');
        this.$raiseEvent({
          name: 'app.module.stickywall.wall.loaded'
        });
      } else {
        this.$logDebug('Failure loading wall');
        this.parentCtrl.newWall();
      }
    },

    validateWall : function(wall) {
      return (wall && wall._id && wall.name && wall.postits);
    },

    getWallDate : function() {
      return this.__wall.date;
    },

    onModuleEvent: function(event) {
      if(event) {
        this.$logDebug('Received event '+event.name);
        if(event.name === "") {

        }
      }
    },

    __onSocketDisconnect: function() {
      console.log('Woops, disconnected !');
      this.wallSocket.close();
      window.reload();
    }
  }
});