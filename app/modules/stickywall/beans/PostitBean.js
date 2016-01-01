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
        "history": {
          $type: "history:History",
          $description: "History of the postit"
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
            }
          },
          $default: {x: 0, y: 0}
        }
      }
    }
  }
});