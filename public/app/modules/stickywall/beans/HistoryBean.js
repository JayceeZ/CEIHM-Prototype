Aria.beanDefinitions({
  $package : "app.modules.stickywall.beans.HistoryBean",
  $description : "Definition of an history",
  $namespaces : {
    "json" : "aria.core.JsonTypes"
  },
  $beans : {
    "History" : {
      $type : "json:Object",
      $description : "Basic description of a contact",
      $properties : {
        "creation": {
          $type: "json:Date",
          $description: "Creation date of the postit",
          $mandatory: true
        },
        "modifications": {
          $type: "json:Array",
          $description: "Modifications of the postit",
          $contentType: {
            $type: "json:Date",
            $description: "Dates of editions"
          }
        }
      }
    }
  }
});