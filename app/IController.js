Aria.interfaceDefinition({
  $classpath: "app.IController",
  $extends: 'aria.templates.IModuleCtrl',
  $events : {
    "app.submodule.load" : "Raised when a submodule templates wants to be loaded"
  },
  $interface: {}
});