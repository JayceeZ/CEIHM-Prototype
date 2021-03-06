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
var ariaWidgetsAriaSkinInterface = require("../AriaSkinInterface");
require("./CfgBeans");
var ariaWidgetsFramesSimpleFrame = require("./SimpleFrame");
var ariaWidgetsFramesTableFrame = require("./TableFrame");
var ariaWidgetsFramesFixedHeightFrame = require("./FixedHeightFrame");
var ariaWidgetsFramesSimpleHTMLFrame = require("./SimpleHTMLFrame");
var ariaCoreJsonValidator = require("../../core/JsonValidator");


/**
 * Frame factory, which provides a method to create a frame.
 * @class aria.widgets.frames.FrameFactory
 */
module.exports = Aria.classDefinition({
    $classpath : 'aria.widgets.frames.FrameFactory',
    $singleton : true,
    $constructor : function () {
        this._frameTypeBuilders = {
            "Table" : ariaWidgetsFramesTableFrame,
            "FixedHeight" : ariaWidgetsFramesFixedHeightFrame,
            "SimpleHTML" : ariaWidgetsFramesSimpleHTMLFrame,
            "Simple" : ariaWidgetsFramesSimpleFrame
        };
    },
    $statics : {
        // ERROR MESSAGES:
        FRAME_INVALID_FRAMETYPE : "Invalid frame type: %1.",
        FRAME_INVALID_CONFIG : "Invalid frame configuration."
    },
    $prototype : {

        /**
         * Normalize a frame configuration (also filling the skinObject property, if not already done).
         * @param {aria.widgets.frames.CfgBeans:FrameCfg} cfg Frame configuration
         * @return {aria.widgets.frames.CfgBeans:FrameCfg} The normalized frame configuration, or null if an error
         * occured (in this case, the error is already logged)
         */
        normalizeFrameCfg : function (cfg) {
            var normalizeCfg = {
                json : cfg,
                beanName : "aria.widgets.frames.CfgBeans.FrameCfg"
            };
            if (ariaCoreJsonValidator.normalize(normalizeCfg)) {
                cfg = normalizeCfg.json;
                var skinObject = cfg.skinObject;
                if (skinObject == null) {
                    skinObject = ariaWidgetsAriaSkinInterface.getSkinObject(cfg.skinnableClass, cfg.sclass);
                    cfg.skinObject = skinObject;
                }
                return cfg;
            } else {
                this.$logError(this.FRAME_INVALID_CONFIG);
                return null;
            }
        },

        /**
         * Create a new frame according to the given configuration object. The type of frame returned (either TableFrame
         * or FixedHeightFrame) depends on the frame.frameType property of the skin class.
         * @param {aria.widgets.frames.CfgBeans:FrameCfg} cfg Frame configuration
         * @return {aria.widgets.frames.Frame} A frame object, or null if an error occured (in this case, the error is
         * logged).
         */
        createFrame : function (cfg) {
            cfg = this.normalizeFrameCfg(cfg); // normalizeFrameCfg also report the error if the cfg is not correct
            if (cfg) {
                var frameTypeName = cfg.skinObject.frame.frameType; // skinObject is set by normalizeFrameCfg
                var frameType = this._frameTypeBuilders[frameTypeName];
                if (frameType) {
                    return new frameType(cfg);
                } else {
                    this.$logError(this.FRAME_INVALID_FRAMETYPE, [frameTypeName]);
                }
            }
        }
    }
});
