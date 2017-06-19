// Ken-Q Analysis
//Copyright (C) 2016 Shawn Banasick
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

// JSlint declarations
/* global resources, d3, VIEW, d3_save_svg, CORR, alasql, window, QAV, $, document, evenRound, UTIL, _  */

(function (PRELIMOUT, QAV, undefined) {
    'use strict';
    // ************************************************************************  view
    // ******  Preliminary Results 1 - draw factor synthetic Q-sorts visuals ********
    //  ******************************************************************************
    PRELIMOUT.showPreliminaryOutput1 = function () {
        // add synthetic factors visualizations
        // $("#synFactorVizTitle").append("<h4>" + synFactorVizTitleText + "</h4>");

        var distStatementDataVizArray = QAV.getState("distStatementDataVizArray");
        var outputForDataViz = QAV.getState("outputForDataViz");
        var userSelectedFactors = QAV.getState("userSelectedFactors");
        // var language = QAV.getState("language");
        var vizConfig = QAV.getState("vizConfig") || {};

        // loop through userSelectedFactors to get each synFactorViz
        for (var i = 0; i < outputForDataViz.length; i++) {
            var synFactorVizName = "synFactorViz" + (i + 1);

            // loop through each distinguishing statement in distStatementDataVizArray[i]
            for (var j = 0; j < distStatementDataVizArray[i].length; j++) {
                // get statement number
                var statementId = distStatementDataVizArray[i][j]["No."];
                // avoid empty objects
                var sigSymbol;
                var testValue = parseInt(statementId, 10);
                if (!isNaN(testValue)) {

                    // get values for calc of direction symbol
                    var sigFactorZscoreKey = "Z-SCR-" + userSelectedFactors[i];
                    var sigFactorZscoreValue = distStatementDataVizArray[i][j][sigFactorZscoreKey];
                    var allFactorZscores = [];

                    // loop through all of the factor z-scores and push to array
                    for (var k = 0; k < userSelectedFactors.length; k++) {
                        var temp1 = "Z-SCR-" + userSelectedFactors[k];
                        var temp2 = distStatementDataVizArray[i][j][temp1];
                        allFactorZscores.push(temp2);
                    }
                    // calc directionSymbol by checking against Zscore in all other factors
                    var otherFactorZscores = _.pull(allFactorZscores, sigFactorZscoreValue);
                    // var factorZscoreAverage = d3.mean(otherFactorZscores);
                    var arrowPointerArrayLeft = [],
                        arrowPointerArrayRight = [];
                    for (var kk = 0; kk < otherFactorZscores.length; kk++) {
                        if (sigFactorZscoreValue - otherFactorZscores[kk] > 0) {
                            arrowPointerArrayRight.push("1");
                        } else {
                            arrowPointerArrayLeft.push("1");
                        }
                    }

                    var directionSymbol;
                    if (otherFactorZscores.length === arrowPointerArrayRight.length && userSelectedFactors.length > 1) {
                        directionSymbol = vizConfig.shouldUseUnicode !== false ?
                            "\u25BA" :
                            ">>"; // " >>>"; "&#9658;";  right-pointing pointer
                    } else if (otherFactorZscores.length === arrowPointerArrayLeft.length) {
                        directionSymbol = vizConfig.shouldUseUnicode !== false ?
                            "\u25C4" :
                            "<<"; //" <<<";  "&#9668;";  left-pointing pointer
                    } else {
                        directionSymbol = "";
                    }
                    // put it all together and insert into object
                    var sigFactorName = "SIG" + userSelectedFactors[i];
                    var sigAt01Level = distStatementDataVizArray[i][j][sigFactorName];
                    var location = statementId - 1;
                    if (sigAt01Level === "*") {
                        sigSymbol = vizConfig.shouldUseUnicode !== false ?
                            "\u25C9" :
                            "** "; //"**";  "&#9673;";  sig at .01
                    } else if (sigAt01Level === "") {
                        sigSymbol = vizConfig.shouldUseUnicode !== false ?
                            "\u25CE" :
                            "* "; // "*";  "&#9678;";  sig at .05
                    }
                    if (vizConfig.shouldShowZscoreArrows !== false) {
                        outputForDataViz[i][location].sigVisualization = (sigSymbol + directionSymbol);
                    } else if (vizConfig.shouldShowZscoreArrows === false) {
                        outputForDataViz[i][location].sigVisualization = sigSymbol;
                    }
                }
            }
        }
        // QAV.setState("outputForDataViz", outputForDataViz);
        PRELIMOUT.drawSynSortTrianglesForOutput(outputForDataViz, userSelectedFactors);
    };
    /*
    **
    **
        // output starts HERE
    **
    **
    */
    PRELIMOUT.drawSynSortTrianglesForOutput = function () {

        // HELPER FUNCTIONS

        function appendNumbersToStatements(outputForDataViz) {
            for (var i = 0; i < outputForDataViz.length; i++) {
                for (var ii = 0; ii < outputForDataViz[i].length; ii++) {
                    if (vizConfig.shouldShowOnlyStateNo === true) {
                        outputForDataViz[i][ii].displayStatements = outputForDataViz[i][ii].statement;
                    } else if (vizConfig.shouldPrependStateNo === false) {
                        outputForDataViz[i][ii].displayStatements = outputForDataViz[i][ii].sortStatement;
                    } else {
                        outputForDataViz[i][ii].displayStatements = outputForDataViz[i][ii].statement + ". " + outputForDataViz[i][ii].sortStatement;
                    }
                }
            }
            return outputForDataViz;
        }

        function trimStatments(outputForDataViz) {
            for (var i = 0; i < outputForDataViz.length; i++) {
                for (var ii = 0; ii < outputForDataViz[i].length; ii++) {
                    if (vizConfig.shouldTrimStatements === true) {
                        var preSubString = outputForDataViz[i][ii].displayStatements;
                        outputForDataViz[i][ii].displayStatements = preSubString.substring(0, vizConfig.trimStatementSize);
                    }
                }
            }
            return outputForDataViz;
        }

        // to draw the sort triangles, esp when unforced sorts present
        function findOccurrences(sortsAsNumbers, uniquesArray) {
            var instancesArray = [];
            var count;
            for (var k = 0; k < uniquesArray.length; k++) {
                count = 0;
                for (var i = 0; i < sortsAsNumbers.length; i++) {
                    if (sortsAsNumbers[i] === uniquesArray[k]) {
                        count++;
                    }
                }
                instancesArray.push(count);
            }
            return instancesArray;
        }

        //  helper to calc heights of svgs
        function getSvgHeight(arr1) {
            var heightAdjustment = 0;
            vizConfig.heightAdjustment = heightAdjustment;
            var b = [],
                prev;
            var arr = _.cloneDeep(arr1);
            arr.sort();
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] !== prev) {
                    b.push(1);
                } else {
                    b[b.length - 1]++;
                }
                prev = arr[i];
            }
            svgHeightCalc = (((parseInt(elementHeight, 10) + 10) * d3.max(b)) + 75);
            return svgHeightCalc; // 25 for the sort values header

        } // end getSvgHeight

        // todo - find cause of error with !=
        function wordwrap(text, max) {
            var language = QAV.getState("language");
            var lines = [];
            var line;
            if (vizConfig.shouldSetWidthForAsian === true) {
                max = vizConfig.asianStatmentLength || 12;
                lines = text.match(new RegExp('.{1,' + max + '}', 'g'));
            } else {
                var regex = new RegExp(".{0," + max + "}(?:\\s|$)", "g");
                while ((line = regex.exec(text)) != "") { // DO NOT CHANGE != TO !== - WILL THROW ERROR
                    lines.push(line);
                } // end while
            } // end 294 else
            return lines;
        } // end function wordwrap

        //  Begin Calcs for viz
        try {
            var sortTriangleShape = QAV.getState("qavSortTriangleShape");
            var currentStatements = QAV.getState("qavCurrentStatements");
            var language = QAV.getState("language");
            var synFactorVizTitleText = resources[language].translation["Synthetic Sort for"];
            var legendTitleText = resources[language].translation.Legend;

            // generates sort column numbers
            var uniques = _.uniq(sortTriangleShape);

            var svgHeight;
            var elementHeight,
                symbolSize,
                vSeparation,
                svgHeightCalc;
            var vizConfig = QAV.getState("vizConfig") || {};
            var cardFontSize = "12px"; // default setting
            var containerWidth = ($(".container")
                .width() - 40);
            var elementWidth,
                config;
            var consensusColor = vizConfig.consensusCustomColor;
            var matchCountColor = vizConfig.matchCountCustomColor;
            var overlapColor = vizConfig.overlapCustomColor;
            var consensusIndicator = vizConfig.shouldUseToIndicateConsensus; //"color / stripe"
            var matchCautionIndicator = vizConfig.shouldUseToIndicateMatchCaution; // color stripe
            var overlapIndicator = vizConfig.shouldUseToIndicateOverlap; // color crosshatch

            var addEmptyQsort = vizConfig.shouldAddEmptySort;

            // user adjust card width
            if (vizConfig.shouldSetCardWidth === true) {
                elementWidth = vizConfig.cardWidth;
                containerWidth = (elementWidth * uniques.length) + 10;
            } else {
                elementWidth = containerWidth / uniques.length;
            }

            // user adjust font size for cards
            if (vizConfig.shouldSetFontSize === true) {
                cardFontSize = vizConfig.fontSize + "px";
            }

            // user adjust card height
            if (vizConfig.shouldSetCardHeight === true) {
                var newHeightValue = vizConfig.cardHeight;
                if (newHeightValue === undefined) {
                    newHeightValue = 110;
                }
                elementHeight = parseInt(newHeightValue, 10);
            } else {
                elementHeight = 110;
            }

            // user adjust sig symbol size
            if (vizConfig.shouldSetSymbolFontSize === true) {
                symbolSize = vizConfig.sigSymbolFontSize + "px";
            } else {
                symbolSize = "12px";
            }

            // user adjust line spacing
            if (vizConfig.shouldSetLineSpacing === true) {
                vSeparation = vizConfig.lineSpacing;
            } else {
                vSeparation = 15;
            }

            var originalDataSorts = QAV.getState("qavRespondentSortsFromDbStored");
            var originalRespondentNames2 = QAV.getState("qavRespondentNames");
            var originalRespondentNames = UTIL.checkUniqueName(originalRespondentNames2);
            var originalStatements = QAV.getState("qavCurrentStatements");
            var originalSortSize = QAV.getState("qavOriginalSortSize");

            var sortsAsNumbers = PRELIMOUT.convertSortsTextToNumbers(originalDataSorts, originalSortSize);

            var outputForDataViz = [];
            for (var yy = 0, yyLen = sortsAsNumbers.length; yy < yyLen; yy++) {
                var tempArray77 = [];
                for (var xx = 0, xxLen = sortsAsNumbers[yy].length; xx < xxLen; xx++) {
                    var tempObject77 = {};
                    originalRespondentNames[yy] = originalRespondentNames[yy].trim();
                    originalRespondentNames[yy] = originalRespondentNames[yy].replace(/ /g, "_");
                    tempObject77.factor = originalRespondentNames[yy];
                    tempObject77.sigVisualization = "";
                    tempObject77.sortStatement = originalStatements[xx];
                    tempObject77.sortValue = sortsAsNumbers[yy][xx];
                    tempObject77.statement = xx + 1;
                    tempArray77.push(tempObject77);
                }
                outputForDataViz.push(tempArray77);
            }
            QAV.setState("qavRespondentNames", originalRespondentNames);
            QAV.setState("respondentNames", originalRespondentNames);

            if (addEmptyQsort === true) {
                var emptyQsortArray = [];
                for (var pp = 0; pp < sortsAsNumbers[0].length; pp++) {
                    var emptyQsortObject = {};
                    emptyQsortObject.factor = "";
                    emptyQsortObject.sigVisualization = "";
                    emptyQsortObject.sortStatement = "";
                    emptyQsortObject.statement = pp + 1;
                    emptyQsortObject.sortValue = sortsAsNumbers[0][pp];
                    emptyQsortArray.push(emptyQsortObject);
                }
                sortsAsNumbers.unshift(sortTriangleShape); // to get sort pattern for empty sort when unrestrained present
                outputForDataViz.unshift(emptyQsortArray);
                originalRespondentNames.unshift("Q-sort Pattern");
            }


            // prepare statements !false sets as default
            appendNumbersToStatements(outputForDataViz);

            // auto adjust if no card header info
            var locateStateY;
            if (vizConfig.shouldShowMatchCounts === true || vizConfig.shouldIndicateDistinguishing) {
                locateStateY = 40;
            } else if (vizConfig.shouldIndicateDistinguishing === undefined) {
                locateStateY = 40;
            } else {
                locateStateY = 20;
            }

            // user trim statements
            if (vizConfig.shouldTrimStatements === true) {
                trimStatments(outputForDataViz);
            }


            // text wrap variables - set in control panel?
            var maxLength;
            var newStatementWidth = vizConfig.statementWidth || 6.75;
            if (vizConfig.shouldSetStatementWidth === true) {
                maxLength = parseInt(((elementWidth - newStatementWidth) / 6.75), 10);
            } else {
                maxLength = parseInt((elementWidth / 6.75), 10);
            }


            /*
             **
             **
             **  BEGIN visualizations calc loop
             **
             **
             */
            // loop through array to draw visualizations   synFactorVizDiv
            var zzPadding;
            for (var z = 0; z < outputForDataViz.length; z++) {

                // get individual distributions of sorts - needed for unforced sorts
                var instances = findOccurrences(sortsAsNumbers[z], uniques);

                // get x position for boxes
                var xPosLoop = [];
                var counterX = 0;
                for (var m = 0; m < instances.length; m++) {
                    for (var p = 0; p < instances[m]; p++) {
                        xPosLoop.push(counterX);
                    }
                    counterX = counterX + 1;
                }

                // get y position for boxes
                var yPosLoop = [];
                var counterY;
                for (var r = 0; r < instances.length; r++) {
                    counterY = 0;
                    for (var s = 0; s < instances[r]; s++) {
                        yPosLoop.push(counterY);
                        counterY = counterY + 1;
                    }
                }

                // adjust if display is only statement numbers
                var onlyNumbersXAdjustment = 0;
                if (vizConfig.shouldShowOnlyStateNo === true) {
                    console.log("only numbers clicked");
                    onlyNumbersXAdjustment = 5;
                }


                // call helper to calc the height of the svg
                svgHeight = getSvgHeight(sortsAsNumbers[z]);

                var zz = z + 1;
                var factorVizDivName = "factorVizDiv" + zz;
                $("#synFactorVizDiv")
                    .append("<div id=" + factorVizDivName + "></div>");
                // padding so download all images will work when it slices id number
                if (zz < 10) {
                    zzPadding = "00";
                } else if (zz < 100) {
                    zzPadding = "0";
                } else {
                    zzPadding = "";
                }

                var idName = "synSortSvgNo" + zzPadding + zz;

                var svg = d3
                    .select("#" + factorVizDivName)
                    .append("svg")
                    .attr('width', (containerWidth + 10))
                    .attr('height', svgHeight)
                    .attr('id', idName)
                    .attr('class', "factorViz");

                var textArray1 = outputForDataViz[z];

                // sort by Q-sort value
                var textArray = textArray1.slice(0);
                textArray.sort(function (a, b) {
                    if (a.zScore === b.zScore) {
                        return a.sortValue - b.sortValue;
                    } else {
                        return b.sortValue - a.sortValue;
                    }
                });

                // add location data
                for (var c = 0; c < textArray.length; c++) {
                    textArray[c].xVal = xPosLoop[c];
                    textArray[c].yVal = yPosLoop[c];
                }

                // begin D3.js drawing
                var index = svg
                    .selectAll("g.node")
                    .data(uniques, function (d) {
                        return d;
                    });

                var indexGroup = index
                    .enter()
                    .append("g")
                    .attr("class", "node");

                // draw headers
                indexGroup
                    .append('rect')
                    .attr('width', elementWidth)
                    .attr('height', '20')
                    .attr('x', function (d) {
                        return ((uniques.indexOf(d) * elementWidth) + 5);
                    })
                    .attr('y', '45')
                    .attr('fill', 'white')
                    .attr('stroke', 'black');

                indexGroup
                    .append('text')
                    .attr('x', function (d) {
                        return ((uniques.indexOf(d) * elementWidth) + (elementWidth / 2) + 5);
                    })
                    .attr('y', '57')
                    .style('text-anchor', 'middle')
                    .attr('class', 'headerText')
                    .attr('font-family', 'Arial')
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'black')
                    .text(function (d) {
                        return d;
                    });

                // associate data with identifiers
                var index2 = svg
                    .selectAll("g.node2")
                    .data(textArray, function (d) {
                        return d.statement;
                    });

                var indexGroup2 = index2
                    .enter()
                    .append("g")
                    .attr("class", "node2");

                // draw boxes for statements
                indexGroup2
                    .append('rect')
                    .attr('width', elementWidth)
                    .attr('height', elementHeight)
                    .attr('x', function (d) {
                        return ((d.xVal * elementWidth) + 5);
                    })
                    .attr('y', function (d) {
                        return ((d.yVal * elementHeight) + 60);
                    })
                    .attr('fill', function (d) {
                        return '#ffffff';
                    })
                    .style('background-color', '#ffffff')
                    .attr('stroke', 'black');

                indexGroup2
                    .append('text')
                    .attr('class', 'wrap')
                    .attr('font-family', 'Arial')
                    .attr('font-size', cardFontSize)
                    .attr('x', function (d) {
                        return ((d.xVal * elementWidth) + 8);
                    })
                    .attr('y', function (d) {
                        return ((d.yVal * elementHeight) + locateStateY + 25);
                    })
                    .attr('dy', 0)
                    .each(function (d) {
                        var lines = wordwrap(d.displayStatements, maxLength);
                        for (var iii = 0; iii < lines.length; iii++) {
                            d3
                                .select(this)
                                .append("tspan")
                                .attr("dy", vSeparation)
                                .attr('text-anchor', 'middle')
                                .attr("x", (d.xVal * elementWidth) + (elementWidth / 2) + onlyNumbersXAdjustment)
                                .text(lines[iii]);
                        }
                    });

                var newText = originalRespondentNames[z];

                svg.append('text')
                    .attr('x', 5)
                    .attr('y', 28)
                    .attr('font-family', 'Arial')
                    .attr('font-size', '30px')
                    .attr('fill', 'black')
                    .text(newText);

                var downloadText = resources[language].translation.downloadImage;
                var $thisSvg = $("#" + factorVizDivName);
                $thisSvg.append('<input class="svgDownloadButton blackHover" name="downloadButton" id="' + originalRespondentNames[z] + 'Image"   type="button" value="' + originalRespondentNames[z] + downloadText + '" />');
                $thisSvg.append('<input class="pngDownloadButton blackHover" name="downloadPngButton" id="' + originalRespondentNames[z] + 'PngImage"   type="button" value="' + originalRespondentNames[z] + ' - Download image as PNG' + '" />');
            } // end z loop to add visualizations


            $('.svgDownloadButton')
                .on('mousedown', function (event) {
                    var vizConfig = QAV.getState("vizConfig") || {};
                    var shouldAddName = vizConfig.shouldAddCustomName;
                    var svgId = $(this)
                        .parent()
                        .find("svg")
                        .attr('id');
                    var arrayIndexNumber = (svgId.slice(-3) - 1);
                    var factorName = originalRespondentNames[arrayIndexNumber];
                    var cleanFactorName = factorName.replace(/\s+/g, '');
                    var date = UTIL.currentDate1();
                    var time = UTIL.currentTime1();
                    var dateTime = date + "_" + time;
                    var projectName = QAV.getState("qavProjectName");
                    var customName = vizConfig.customName;
                    if (shouldAddName === true) {
                        if (vizConfig.customNameLocation === "prepend") {
                            config = {
                                filename: customName + "_" + projectName + "_" + cleanFactorName
                            };
                        } else if (vizConfig.customNameLocation === "append") {
                            config = {
                                filename: projectName + "_" + cleanFactorName + "_" + customName
                            };
                        } else if (vizConfig.customNameLocation === "replace") {
                            config = {
                                filename: customName
                            };
                        } else {
                            config = {
                                filename: projectName + "_" + cleanFactorName
                            };
                        }
                    } else {
                        config = {
                            filename: projectName + "_" + cleanFactorName
                        };
                    }
                    d3_save_svg.save(d3.select('#' + svgId)
                        .node(), config);
                });



            $('.pngDownloadButton')
                .on('mousedown', function (event) {
                    var nameConfig;
                    var vizConfig = QAV.getState("vizConfig") || {};
                    var shouldAddName = vizConfig.shouldAddCustomName;
                    var svgId = $(this)
                        .parent()
                        .find("svg")
                        .attr('id');
                    var arrayIndexNumber = (svgId.slice(-3) - 1);
                    var factorName = originalRespondentNames[arrayIndexNumber];
                    var cleanFactorName = factorName.replace(/\s+/g, '');
                    var date = UTIL.currentDate1();
                    var time = UTIL.currentTime1();
                    var dateTime = date + "_" + time;
                    var projectName = QAV.getState("qavProjectName");
                    var customName = vizConfig.customName;
                    if (shouldAddName === true) {
                        if (vizConfig.customNameLocation === "prepend") {
                            nameConfig = customName + "_" + projectName + "_" + cleanFactorName;
                        } else if (vizConfig.customNameLocation === "append") {
                            nameConfig = projectName + "_" + cleanFactorName + "_" + customName;
                        } else if (vizConfig.customNameLocation === "replace") {
                            nameConfig = customName;
                        } else {
                            nameConfig = projectName + "_" + cleanFactorName;
                        }
                    } else {
                        nameConfig = projectName + "_" + cleanFactorName;
                    }

                    var svgString = getSVGString(d3.select('#' + svgId)
                        .node());
                    var thisSvgCharacteristics = d3.select('#' + svgId);
                    var width = parseInt(thisSvgCharacteristics.style("width"), 10) + 2;
                    var height = parseInt(thisSvgCharacteristics.style("height"), 10);
                    svgString2Image(svgString, 2 * width, 2 * height, 'png', save); // passes Blob and filesize String to the callback
                    var filenamePng = nameConfig + '.png';

                    function save(dataBlob, filesize) {
                        saveAs(dataBlob, filenamePng); // FileSaver.js function
                    }
                });

        } catch (err) {
            console.log(err);
            var errorPanel = $("#genericErrorModal .errorPanel");
            errorPanel.empty();
            errorPanel.append("<p>Q-sorts must be loaded before display</p><br>");
            VIEW.showGenericErrorModal();
        }
    }; // end function


    /*#factorVizDiv2 > input
    Download all Q-sort images with 1 button click
    */
    PRELIMOUT.downloadAllImages = function () {
        try {
            var originalRespondentNames = QAV.getState("qavRespondentNames");
            for (var i = 0; i < originalRespondentNames.length; i++) {
                var selector = "#" + originalRespondentNames[i] + "Image";
                $(selector).trigger("mousedown");
            }
        } catch (err) {
            var errorPanel = $("#genericErrorModal .errorPanel");
            errorPanel.empty();
            errorPanel.append("<p>Q-sorts must be displayed before download</p><br>");
            VIEW.showGenericErrorModal();
        }
    };

    PRELIMOUT.downloadAllPngImages = function () {
        try {
            var originalRespondentNames = QAV.getState("qavRespondentNames");
            var i = 0;
            setInterval(function () {
                if (i < originalRespondentNames.length) {
                    var selector = "#" + originalRespondentNames[i] + "PngImage";
                    PRELIMOUT.downloadPngImage(selector);
                    i++;
                }
            }, 2000);



            // for (var i = 0; i < originalRespondentNames.length; i++) {
            //     var selector = "#" + originalRespondentNames[i] + "PngImage";
            //     setTimeout(function () {
            //         PRELIMOUT.downloadPngImage(selector);
            //     }, 2000);

        } catch (err) {
            var errorPanel = $("#genericErrorModal .errorPanel");
            errorPanel.empty();
            errorPanel.append("<p>Q-sorts must be displayed before download</p><br>");
            VIEW.showGenericErrorModal();
        }
    };

    PRELIMOUT.downloadPngImage = function (selector) {
        console.log("triggered");
        $(selector).trigger("mousedown");
    };

    PRELIMOUT.convertSortsTextToNumbers = function (sortsTextFromDb, originalSortSize) {
        var originalRespondentNames = QAV.getState("qavRespondentNames");
        var sortsAsNumbers = [];
        // var maxArrayValue;

        // skip conversion if data coming from somewhere other than pasted data
        if (_.isArray(sortsTextFromDb[0]) === false) {
            _(sortsTextFromDb).forEach(function (element, j) {
                var startPoint = 0;
                var endPoint = 2;
                var tempArray = [];
                var loopLen = originalSortSize;
                var i, numberFragment, convertedNumber;

                for (i = 0; i < loopLen; i++) {
                    numberFragment = element.slice(startPoint, endPoint);
                    convertedNumber = +numberFragment;
                    // check to confirm sort value is numeric
                    if (isNaN(convertedNumber)) {
                        console.log("non-numeric data value");
                        var errorPanel = $("#genericErrorModal .errorPanel");
                        errorPanel.empty();
                        errorPanel.append("<p>The Q-sort for respondent " + originalRespondentNames[j] + " contains a non-numeric data value</p>");
                        VIEW.showGenericErrorModal();
                    }
                    tempArray.push(convertedNumber);
                    startPoint = startPoint + 2;
                    endPoint = endPoint + 2;
                }
                sortsAsNumbers.push(tempArray);
            }).value();
        } else {
            sortsAsNumbers = _.cloneDeep(sortsTextFromDb);
        }
        QAV.setState("sortsAsNumbers", sortsAsNumbers);
        return sortsAsNumbers;
    };

    // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
    function getSVGString(svgNode) {
        svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
        var cssStyleText = getCSSStyles(svgNode);
        appendCSS(cssStyleText, svgNode);

        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
        svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

        return svgString;

        function getCSSStyles(parentElement) {
            var selectorTextArr = [];

            // Add Parent element Id and Classes to the list
            selectorTextArr.push('#' + parentElement.id);
            for (var c = 0; c < parentElement.classList.length; c++)
                if (!contains('.' + parentElement.classList[c], selectorTextArr))
                    selectorTextArr.push('.' + parentElement.classList[c]);

            // Add Children element Ids and Classes to the list
            var nodes = parentElement.getElementsByTagName("*");
            for (var i = 0; i < nodes.length; i++) {
                var id = nodes[i].id;
                if (!contains('#' + id, selectorTextArr))
                    selectorTextArr.push('#' + id);

                var classes = nodes[i].classList;
                for (var c = 0; c < classes.length; c++)
                    if (!contains('.' + classes[c], selectorTextArr))
                        selectorTextArr.push('.' + classes[c]);
            }

            // Extract CSS Rules
            var extractedCSSText = "";
            for (var i = 0; i < document.styleSheets.length; i++) {
                var s = document.styleSheets[i];

                try {
                    if (!s.cssRules) continue;
                } catch (e) {
                    if (e.name !== 'SecurityError') throw e; // for Firefox
                    continue;
                }

                var cssRules = s.cssRules;
                for (var r = 0; r < cssRules.length; r++) {
                    if (contains(cssRules[r].selectorText, selectorTextArr))
                        extractedCSSText += cssRules[r].cssText;
                }
            }
            return extractedCSSText;

            function contains(str, arr) {
                return arr.indexOf(str) === -1 ? false : true;
            }
        }

        function appendCSS(cssText, element) {
            var styleElement = document.createElement("style");
            styleElement.setAttribute("type", "text/css");
            styleElement.innerHTML = cssText;
            var refNode = element.hasChildNodes() ? element.children[0] : null;
            element.insertBefore(styleElement, refNode);
        }
    }


    function svgString2Image(svgString, width, height, format, callback) {
        var format = format ? format : 'png';
        var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        var image = new Image();
        image.onload = function () {
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);

            canvas.toBlob(function (blob) {
                var filesize = Math.round(blob.length / 1024) + ' KB';
                if (callback) callback(blob, filesize);
            });
        };
        image.src = imgsrc;
    }



}(window.PRELIMOUT = window.PRELIMOUT || {}, QAV));