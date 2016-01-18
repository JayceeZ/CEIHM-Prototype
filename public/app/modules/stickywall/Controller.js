Aria.classDefinition({
  $classpath: "app.modules.stickywall.Controller",
  $extends: "aria.templates.ModuleCtrl",
  $implements: ["app.modules.stickywall.IController"],

  $dependencies: [ //
    "aria.utils.Json", //
    "app.modules.stickywall.utils.PostitUtil", //
    "app.modules.stickywall.beans.PostitBean"
  ],

  $constructor: function() {
    // call parent constructor
    this.$ModuleCtrl.constructor.call(this);

    // Utils
    this.$postitUtil = app.modules.stickywall.utils.PostitUtil;

    // Wall
    this.wallSocket = null;
    this.__wall = {name: "Undefined", postits: []};
  },

  $destructor: function() {
    this.$ModuleCtrl.$destructor.call(this);
  },

  $statics: {
    "SERVERIP": "10.212.97.167",
    "INVALID_POSTIT": "Post-it %1 does not respect Bean structure",
    "TEST_WALL_ID": "5689bee245f371ac1d9eb633"
  },

  $prototype: {
    // specify the public interface for this module
    $publicInterfaceName: "app.modules.stickywall.IController",

    init: function(args, cb) {
      this.$logDebug("Init");

      this._data.dialogOpen = false;

      this._loadWall(this.TEST_WALL_ID);

      // Keep going
      this.$callback(cb);
    },

    onChangeWall: function(id) {
      this._loadWall(id);
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
        this.$logError(this.INVALID_POSTIT, [id]);
        return;
      }
    },

    deletePostit: function(id) {
      if(this.wallSocket) {
        this.wallSocket.emit('delete_postit', {id: id});
      }
    },

    updatePostit: function(id, name, content, x, y) {
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
      if(this.wallSocket && (x || y))
        this.wallSocket.emit('update_postit_position', {id: id, position: {x: x, y: y}});
    },

    getPostits: function() {
      return _.clone(this.__wall.postits, true);
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
      this.wallSocket = io('http://'+this.SERVERIP+':8001/');
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
        url: "http://"+this.SERVERIP+":8000/api/wall/" + id,
        method: "get",
        expectedResponseType: 'json',
        callback: {
          fn: this._onWallLoaded,
          scope: this,
          args: {
            callback: this._onWallLoaded
          }
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
      this.$logDebug('New Postit ('+data+')');
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.postit.created',
        postit: data
      });
    },

    __onPostitRemoved : function(data) {
      this.$logDebug('Postit ('+data+') removed');
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.postit.removed',
        id: data.id
      });
    },

    _onWallLoaded: function(response, args) {
      this.__wall = response.responseJSON;
      this.$logDebug('Wall ('+this.__wall._id+') loaded');
      this.$raiseEvent({
        name: 'app.module.stickywall.wall.loaded'
      });
    },

    __onSocketDisconnect: function() {
      console.log('Woops, disconnected !');
      this.wallSocket.close();
      this.wallSocket = null;
    }
  }
});