Aria.beanDefinitions({
  $package : "app.modules.stickywall.beans.PostitBean",
  $description : "Definition of a postit",
  $namespaces : {
    "json" : "aria.core.JsonTypes",
    "history" : "app.modules.stickywall.beans.HistoryBean"
  },
  $beans : {
    "Postit" : {
      $type: "json:Object",
      $description: "Post-it",
      $properties: {
        "name": {
          $type: "json:String",
          $description: "Name of the postit",
          $mandatory: true
        },
        "content": {
          $type: "json:String",
          $description: "Content of the postit",
          $mandatory: true
        },
        "file": {
          $type: "json:String",
          $description: "File of the postit"
        },
        "position": {
          $type: "json:Object",
          $description: "Position of the post-it",
          $properties: {
            "x": {
              $type: "json:Integer",
              $description: "Position abscissa"
            },
            "y": {
              $type: "json:Integer",
              $description: "Position ordinate"
            },
            "z": {
              $type: "json:Integer",
              $description: "Position overlap"
            }
          },
          $default: {x: 0, y: 0, z: 0}
        },
        "size": {
          $type: "json:Object",
          $description: "Size of the post-it",
          $properties: {
            "width": {
              $type: "json:Integer",
              $description: "Width of the post-it"
            },
            "height": {
              $type: "json:Integer",
              $description: "Height of the post-it"
            }
          },
          $default: {width: 50, height: 50}
        }
      }
    }
  }
});