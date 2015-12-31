Aria.tplScriptDefinition({
    $classpath: 'common.templates.MainScript',
    $dependencies: ['aria.utils.Json'],

    $constructor : function() {

    },

    $prototype : {
        $dataReady : function() {

        },

        onModuleEvent : function (evt) {
            if (evt.name === "app.{somename}") {
                // perform some actions on the view
            }
        }
    }
});