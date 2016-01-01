
Aria.classDefinition({
  $classpath: "app.modules.stickywall.utils.PostitUtil",
  $dependencies: [],

  $singleton: true,

  $prototype: {

    _createEmptyPostit: function() {
      return {
          name: "New post-it",
          content: ""
      };
    }

  }

});
