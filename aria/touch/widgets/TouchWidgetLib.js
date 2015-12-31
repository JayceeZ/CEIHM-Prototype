/*
 * Aria Templates 1.7.15 - 11 Dec 2015
 *
 * Copyright 2009-2015 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Aria = require("../../Aria");
var ariaWidgetLibsWidgetLib = require("../../widgetLibs/WidgetLib");


/**
 * Touch widget library.
 */
module.exports = Aria.classDefinition({
    $classpath : "aria.touch.widgets.TouchWidgetLib",
    $extends : ariaWidgetLibsWidgetLib,
    $singleton : true,
    $prototype : {
        /**
         * Map of all the widgets in the library. Keys in the map are widget names as they can be used in templates.
         * Values are the corresponding classpaths.
         * @type Object
         */
        widgets : {
            "Slider" : "aria.touch.widgets.Slider",
            "DoubleSlider" : "aria.touch.widgets.DoubleSlider",
            "Button" : "aria.touch.widgets.Button",
            "Popup" : "aria.touch.widgets.Popup"
        }
    }
});
