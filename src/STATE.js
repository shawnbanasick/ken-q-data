//Ken-Q Analysis
//Copyright (C) 2016 Shawn Banasick
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.


// JSlint declarations
/* global window, $, _ */

// QAV is the global state data store
(function (QAV, undefined) {
    'use strict';

    // set default language
    QAV.language = "en-us";

    QAV.setState = function (key, value) {
        var value2 = _.cloneDeep(value);
        QAV[key] = value2;
    };

    QAV.getState = function (key) {
        var value = _.cloneDeep(QAV[key]);
        return value;
    };

    // set defaults for composite factor visualizations
    QAV.vizConfig = {};
    QAV.vizConfig.shouldHaveLegend = false;
    QAV.vizConfig.shouldPrependStateNo = false;

}(window.QAV = window.QAV || {}));