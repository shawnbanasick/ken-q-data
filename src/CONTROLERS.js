//Ken-Q Analysis
//Copyright (C) 2016 Shawn Banasick
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.


// JSlint declarations
/* global window, $, resources, EXCEL, FIREBASE, DEMO, d3, INPUT, ROTA, VARIMAX, OUTPUT, LOAD, localStorage, _, d3_save_svg, document, Huebee, PASTE, CORR, sessionStorage, CENTROID, VIEW, PCA, QAV, UTIL, performance*/

(function (CONTROLERS, QAV, undefined) {

    /*
    //
    // **** SECTION 1 **** data input
    //
    */

    // ***** Persist Pasted Sort Data in PQMethod input section *****************
    // todo - move this to manual input file?

    // Use Demo Data Set Option - display database selected
    (function () {
        $("#existingDatabaseSelect").change(function () {
            var testValue = $(this).val();
            if (testValue === "Lipset") {
                DEMO.returnLipset();
            } else if (testValue === "Medium") {
                DEMO.returnMedium();
            } else if (testValue === "Large") {
                DEMO.returnQuotes();
            }
        });
    })();


    // call check manual input sort symmetry
    (function () {
        $("#sortInputSubmit").on('click', function (e) {
            e.preventDefault();
            INPUT.isSortSymmetric();
            $('#respondentNameInput1').focus();
        });
    })();

    (function () {
        var input = document.getElementById('sortInputBox');

        // pull user input from memory if it exists
        var temp1 = localStorage.getItem("sortInputBox");
        if (temp1) {
            input.value = temp1;
        }

        // capture sorts from user-input and set into memory
        $('#sortInputBox').on('input propertychange change', function () {
            localStorage.setItem("sortInputBox", this.value);
        });
    })();

    (function () {
        $('#stageDataPqmethod').on('click', function () {
            PASTE.stageDataPqmethod();
        });
    })();

    // to clear so new data can be added
    (function () {
        $("#clearInputBoxDataButton").on("click", function () {
            $("#sortInputBox").val("");
            localStorage.setItem("sortInputBox", "");
            QAV.setState("sortInputBox", "");
            $("#statementsInputBoxPqmethod").val("");
            localStorage.setItem("qavStatementsInputBoxPqmethod", "");
        });
    })();

    // import EXCEL files
    (function () {
        $("#fileSelect").on("change", function (e) {
            QAV.setState("typeOfExcelFile", "user-input");
            EXCEL.filePicked(e);
        });
    })();


    // import Unforced EXCEL files
    (function () {
        $("#fileSelectUnforced").on("change", function (e) {
            QAV.setState("typeOfExcelFile", "unforced");
            EXCEL.filePicked(e);
        });
    })();


    // import Ken-Q output files to EXCEL
    (function () {
        $("#fileSelectKenq").on("change", function (e) {
            EXCEL.filePickedKenq(e);
        });
    })();

    // import DAT files to PASTE
    (function () {
        $("#fileSelectPQM").on("change", function (e) {
            PASTE.filePickedTextPQM(e);
        });
    })();

    // import STA files to PASTE
    (function () {
        $("#fileSelectSTA").on("change", function (e) {
            PASTE.filePickedTextSTA(e);
        });
    })();

    // import STA files to PASTE     displayJsonData
    (function () {
        $("#fileSelectJSON").on("change", function (e) {
            FIREBASE.filePickedJSON(e);
        });
    })();

    (function () {
        $("#stageJsonData").on("click", function (e) {
            FIREBASE.stageJsonData(e);
            $(".jsonDownloadPQ").show();
        });
    })();

    (function () {
        $("#downloadJsonData").on("click", function (e) {
            FIREBASE.downloadJsonData(e);
        });
    })();

    (function () {
        $("#existingDatabaseRespondentList").on("click", "button", function (e) {
            e.preventDefault();
            var index = $(this).parent().index();
            $(this).parent().remove();
            var respondentNames = QAV.getState("qavRespondentNames");
            var sorts = QAV.getState("qavRespondentSortsFromDbStored");
            respondentNames.splice(index, 1);
            sorts.splice(index, 1);

            if ($.fn.DataTable.isDataTable('#correlationTable2')) {
                $('#correlationTable2').DataTable().destroy();
                $('#correlationTable2').html("");
            }

            QAV.setState("qavRespondentNames", respondentNames);
            QAV.setState("qavRespondentSortsFromDbStored", sorts);
        });
    })();

    (function () {
        $("#exportJsonSortsPQM").on("click", function (e) {
            e.preventDefault();
            EXCEL.exportExcelSortsPQM();
        });
    })();

    (function () {
        $("#exportStatementsPQM").on("click", function (e) {
            e.preventDefault();
            EXCEL.exportStatementsToPqmethod();
        });
    })();


    (function () {
        $("#clearAnalysisDataButton").on("click", function (e) {
            e.preventDefault();
            $("#existingDatabaseStatementList").empty();
            $("#existingDatabaseRespondentList").empty();
            VIEW.clearPreviousTables();
        });
    })();

    (function () {
        $("#disableSymmetryButton").on("click", function (e) {
            e.preventDefault();
            var language = QAV.getState("language");
            var noSymmButText = resources[language].translation["Symmetry Check Disabled"];
            var symmButText = resources[language].translation["Disable Symmetry Check"];
            var button = $(this);
            if (button.hasClass("buttonActionComplete")) {
                button.prop('value', symmButText);
                button.addClass("blackHover");
                button.removeClass("buttonActionComplete");
                QAV.setState("doSymmetryCheck", "true");
            } else {
                button.prop('value', noSymmButText);
                button.removeClass("blackHover");
                button.addClass("buttonActionComplete");
                QAV.setState("doSymmetryCheck", "false");
            }
        });
    })();

    (function () {
        $("#disableErrorSoundButton").on("click", function (e) {
            e.preventDefault();
            var language = QAV.getState("language");
            var noErrorButText = resources[language].translation["AUDIO ERROR WARNING DISABLED"];
            var errorButText = resources[language].translation["Disable Audio Error Warning"];
            var button = $(this);
            if (button.hasClass("buttonActionComplete")) {
                button.prop('value', errorButText);
                button.addClass("blackHover");
                button.removeClass("buttonActionComplete");
                QAV.setState("doErrorSound", "true");
            } else {
                button.prop('value', noErrorButText);
                button.removeClass("blackHover");
                button.addClass("buttonActionComplete");
                QAV.setState("doErrorSound", "false");
            }
        });
    })();

    /*
    //
    // **** SECTION 2 **** correlations
    //
    */


    // start correlation anaysis from demo data
    (function () {
        $("#beginAnalysisLocalData").on("click", function () {
            CORR.createCorrelationTable();
        });
    })();


    /*
    //
    // **** SECTION 3 **** factor extractions
    //
    */




    /*
    //
    // **** SECTION 4 **** Rotation
    //
    */





    (function () {
        // download judgemental rotation chart
        $(".rotationChartDownloadButton").on("click", function () {
            var date = UTIL.currentDate1();
            var time = UTIL.currentTime1();
            var dateTime = date + "_" + time;
            var projectName = QAV.getState("qavProjectName");
            var language = QAV.getState("language");
            var scatterPlotTranslation = resources[language].translation["Download Rotation Chart"];

            var config = {
                filename: projectName + "_" + scatterPlotTranslation + "_" + dateTime,
            };
            d3_save_svg.save(d3.select('#scatterChart').node(), config);
        });
    })();

    // set judgemental rotation chart options
    (function () {
        $(".rotationChartOptionsButton").on("mousedown", function (e) {
            e.preventDefault();
            VIEW.showRotationChartOptionsModal();
        });
    })();

    (function () {
        $("#rotationChartOptionsModal").on('change', 'input[type=color]', function () {
            var rotChartConfig = QAV.getState("rotChartConfig") || {};
            var hexCode2 = $(this).val();
            rotChartConfig[$(this).attr('name')] = hexCode2;
            QAV.setState("rotChartConfig", rotChartConfig);
        });
    })();

    // control rotation chart options
    (function () {
        $("#rotationChartOptionsModal").on('click', '.applyChanges', function () {
            var rotChartConfig = QAV.getState("rotChartConfig") || {};
            rotChartConfig.significanceColorA = rotChartConfig.significanceColorAPrep;
            rotChartConfig.significanceColorB = rotChartConfig.significanceColorBPrep;
            QAV.setState("rotChartConfig", rotChartConfig);

            $("#twoFactorDisplayTableDiv").remove();

            $("#chartAndTableContainerDiv").append($('<div/>').attr("id", "twoFactorDisplayTableDiv"));
            $("#twoFactorDisplayTableDiv").append($('<table/>').attr("id", "twoFactorDisplayTable").addClass("display compact nowrap cell-border").attr("width", "100%"));

            $("#generateRotationItemsButton").click();

            $("#rotationChartOptionsModal").iziModal('close');
        });
    })();

    // close modal box
    (function () {
        $("#rotationChartOptionsModal").on('click', '.button-cancel', function () {
            $("#rotationChartOptionsModal").iziModal('close');
        });
    })();



    /*
    //
    // **** SECTION 5 ****  (factor loadings)
    //
    */


    /*
    //
    // **** SECTION 6 **** output
    //
    */

    // page setup actions for page reload
    (function () {
        // hide download button until after preliminary results are displayed
        $("#downloadResultsButton").hide();
        $("#downloadCsvResultsButton").hide();
        $("#displayQuickResultsButton").hide();
        $("#factorVizOptionsDiv").show();

        // tracker for results download / display buttons
        QAV.setState("outputComplete", "false");
    })();



    // display quick results button event listener
    (function () {
        $('#displayQuickResultsButton').on('click', function () {
            // pull the state data (selected factor loadings - checkboxes) from table
            var results = [];
            var loopLen1 = QAV.getState("qavRespondentNames").length;
            var data = $('#factorRotationTable2').DataTable();
            for (var i = 0; i < loopLen1; i++) {
                var data2 = data.row(i).data();
                results.push(data2);
            }
            QAV.setState("results", results);

            // get selected factors information
            PRELIMOUT.getFactorsForAnalysis();

            // begins preliminary results display function cascade
            var canOutput = PRELIMOUT.pullFlaggedFactorLoadings();

            if (canOutput !== "false") {
                OUTPUT.generateOutput();
                VIEW.clearPreviousTables();
                // CORR.drawRawSortsRadviz();
                PRELIMOUT.showPreliminaryOutput1();
                $("#downloadResultsButton").show();
                $("#downloadCsvResultsButton").show();
                // $("#clearStorageButton").show();
            }
        });
    })();



    (function () {
        $("#downloadCsvResultsButton").on("click", function () {
            // OUTPUT.downloadOutput();
            OUTPUT.downloadCsvOutputFile();
        });
    })();



    // generate visualizations button
    (function () {
        $("#selectFactorsForOutputButton").on("click", function () {
            PRELIMOUT.drawSynSortTrianglesForOutput();
        });
    })();


    /*
     **
     **    Visualizations Panel event listeners     
     **
     */
    // should include legend? - event handler
    (function () {
        $("#includeLegendDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#includeLegendDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldHaveLegend = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldHaveLegend = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should prepend statement numbers? - event handler
    (function () {
        $("#prependStateNoDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#prependStateNoDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldPrependStateNo = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldPrependStateNo = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should show only statement numbers? - event handler
    (function () {
        $("#showOnlyStateNoDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#showOnlyStateNoDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldShowOnlyStateNo = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldShowOnlyStateNo = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();




    // add empty sort visualization? - event handler
    (function () {
        $("#addEmptySortDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#addEmptySortDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldAddEmptySort = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldAddEmptySort = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();


    // should set Card Height? - event handler
    (function () {
        $("#setCardHeightDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setCardHeightDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetCardHeight = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetCardHeight = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should set card width? - event handler
    (function () {
        $("#setCardWidthDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setCardWidthDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetCardWidth = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetCardWidth = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should set font size? - event handler
    (function () {
        $("#setFontSizeDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setFontSizeDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetFontSize = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetFontSize = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should set font size? - event handler
    (function () {
        $("#setStatementWidthDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setStatementWidthDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetStatementWidth = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetStatementWidth = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should set line spacing? - event handler
    (function () {
        $("#adjustLineSpacingDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#adjustLineSpacingDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetLineSpacing = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetLineSpacing = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should trim statements? - event handler  trimStatementsDiv
    (function () {
        $("#trimStatementsDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#trimStatementsDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldTrimStatements = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldTrimStatements = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // Asian Language set width? - event handler  trimStatementsDiv
    (function () {
        $("#setAsianStatementsLengthDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setAsianStatementsLengthDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetWidthForAsian = true;
                vizConfig.asianStatmentLength = 12;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetWidthForAsian = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // indicate significance? - event handler
    (function () {
        $("#showSignificanceSymbolsDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#showSignificanceSymbolsDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldIndicateDistinguishing = true;
                $('#useUnicodeYes').trigger("click");
                vizConfig.shouldUseUnicode = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldIndicateDistinguishing = false;
                $('#useUnicodeSymbolsDiv .radioHighlight2').removeClass("selected");
                $('#zscoreArrowDirectionDiv .radioHighlight2').removeClass("active");
                $('#setSymbolFontSizeDiv .radioHighlight2').removeClass("active");
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should use Unicode symbols? - event handler  #useUnicodeSymbolsDiv
    (function () {
        $("#useUnicodeSymbolsDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#useUnicodeSymbolsDiv .radioHighlight2').removeClass("selected");
            $(this).parent().addClass("selected");
            $("label[for='" + $(this).attr('id') + "']").addClass("selected");
            var $radioOption = ($(this).val());
            if ($radioOption === "unicode") {
                vizConfig.shouldUseUnicode = true;
            } else if ($radioOption === "ascii") {
                vizConfig.shouldUseUnicode = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should use Unicode symbols? - event handler  #useUnicodeSymbolsDiv
    (function () {
        $("#setSymbolFontSizeDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setSymbolFontSizeDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldSetSymbolFontSize = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldSetSymbolFontSize = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should show zscore factor comparison arrows? - event handler
    (function () {
        $("#zscoreArrowDirectionDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#zscoreArrowDirectionDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldShowZscoreArrows = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldShowZscoreArrows = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should show zscore factor comparison arrows? - event handler
    (function () {
        $("#displayConsensusStatementsDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#displayConsensusStatementsDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldIndicateConsensus = true;
                $('#setConsensusSymbolNo').trigger("click");
                vizConfig.shouldUseToIndicateConsensus = "stripe";
            } else if ($radioOption === "No") {
                vizConfig.shouldIndicateConsensus = false;
                $('#setConsensusSymbolDiv .radioHighlight2').removeClass("selected");
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should color vs stripe for consensus? - event handler
    (function () {
        $("#setConsensusSymbolDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setConsensusSymbolDiv .radioHighlight2').removeClass("selected");
            $(this).parent().addClass("selected");
            $("label[for='" + $(this).attr('id') + "']").addClass("selected");
            var $radioOption = ($(this).val());
            if ($radioOption === "COLOR") {
                vizConfig.shouldUseToIndicateConsensus = "color";
            } else if ($radioOption === "STRIPE") {
                vizConfig.shouldUseToIndicateConsensus = "stripe";
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should show matching counts? - event handler
    (function () {
        $("#useMatchCountDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#useMatchCountDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldShowMatchCounts = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldShowMatchCounts = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should show background color? - event handler
    (function () {
        $("#indicateMatchCountAsBackgroundDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#indicateMatchCountAsBackgroundDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldShowBackgroundColor = true;
                $('#setMatchCountCautionIndicatorNo').trigger("click");
                vizConfig.shouldUseToIndicateMatchCaution = "stripe";
                $('#setMatchConsensusOverlapIndicatorNo').trigger("click");
                vizConfig.shouldUseToIndicateOverlap = "crosshatch";
            } else if ($radioOption === "No") {
                vizConfig.shouldShowBackgroundColor = false;
                $('#setMatchCountCautionIndicatorDiv .radioHighlight2').removeClass("selected");
                $('#setMatchConsensusOverlapIndicatorDiv .radioHighlight2').removeClass("selected");
            }
            vizConfig.backgroundColorCutoff = 0;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should color vs stripe for consensus? - event handler
    (function () {
        $("#setMatchCountCautionIndicatorDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setMatchCountCautionIndicatorDiv .radioHighlight2').removeClass("selected");
            $(this).parent().addClass("selected");
            $("label[for='" + $(this).attr('id') + "']").addClass("selected");
            var $radioOption = ($(this).val());
            if ($radioOption === "COLOR") {
                vizConfig.shouldUseToIndicateMatchCaution = "color";
            } else if ($radioOption === "STRIPE") {
                vizConfig.shouldUseToIndicateMatchCaution = "stripe";
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should color vs stripe for consensus? - event handler
    (function () {
        $("#setMatchConsensusOverlapIndicatorDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#setMatchConsensusOverlapIndicatorDiv .radioHighlight2').removeClass("selected");
            $(this).parent().addClass("selected");
            $("label[for='" + $(this).attr('id') + "']").addClass("selected");
            var $radioOption = ($(this).val());
            if ($radioOption === "COLOR") {
                vizConfig.shouldUseToIndicateOverlap = "color";
            } else if ($radioOption === "CROSSHATCH") {
                vizConfig.shouldUseToIndicateOverlap = "crosshatch";
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    // should add custom name? - event handler
    (function () {
        $("#addCustomNameDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#addCustomNameDiv .radioHighlight2').removeClass("active");
            $(this).parent().addClass("active");
            $("label[for='" + $(this).attr('id') + "']").addClass("active");
            var $radioOption = ($(this).val());
            if ($radioOption === "Yes") {
                vizConfig.shouldAddCustomName = true;
            } else if ($radioOption === "No") {
                vizConfig.shouldAddCustomName = false;
            }
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $("#customNameLocationDiv :radio").on('click', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            $('#customNameLocationDiv .radioHighlight2').removeClass("selected");
            $(this).parent().addClass("selected");
            $("label[for='" + $(this).attr('id') + "']").addClass("selected");
            var $radioOption = ($(this).val());
            vizConfig.customNameLocation = $radioOption;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $("#showDisplayPanelButton").on('click', function () {
            var language = QAV.getState("language");
            var hide = resources[language].translation.HIDE;
            var view = resources[language].translation.VIEW;
            $(this).val(function (i, value) {
                return value === hide ? view : hide;
            });
            $("#vizPanelHideContainer").toggle();
        });
    })();


    (function () {
        $("#updateDisplayButton").on('click', function () {
            VIEW.clearPreviousTables();
            $("#correlationSpinnerText").css('visibility', 'visible');
            setTimeout(function () {
                PRELIMOUT.drawSynSortTrianglesForOutput();
                $("#correlationSpinnerText").css('visibility', 'hidden');
            }, 50);

        });
    })();

    (function () {
        $("#downloadAllImagesButton").on('click', function () {
            console.log("clicked");
            VIEW.showDownloadAllImagesConfirmModal();
        });
    })();

    (function () {
        $("#downloadAllImagesButton").on('click', function () {
            console.log("clicked");
            VIEW.showDownloadAllImagesConfirmModal();
        });
    })();

    //
    // Visualization Control Panel On-change event listeners
    //

    // capture card height input in Viz panel   #cardHeightInputBox
    (function () {
        $('#cardHeightInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var cardHeight = $('#cardHeightInputBox').val();
            UTIL.checkIfValueIsNumber(cardHeight, "cardHeightInputBox");
            if (cardHeight > 500) {
                cardHeight = 500;
            } else if (cardHeight < 5) {
                cardHeight = 5;
            }
            vizConfig.cardHeight = cardHeight;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#cardWidthInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var cardWidth = $('#cardWidthInputBox').val();
            UTIL.checkIfValueIsNumber(cardWidth, "cardWidthInputBox");
            if (cardWidth > 500) {
                cardWidth = 500;
            } else if (cardWidth < 5) {
                cardWidth = 5;
            }
            vizConfig.cardWidth = cardWidth;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#fontSizeInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var fontSize = $('#fontSizeInputBox').val();
            UTIL.checkIfValueIsNumber(fontSize, "fontSizeInputBox");
            if (fontSize > 180) {
                fontSize = 180;
            } else if (fontSize < 4) {
                fontSize = 4;
            }
            vizConfig.fontSize = fontSize;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#statementWidthInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var statementWidth = $('#statementWidthInputBox').val();
            UTIL.checkIfValueIsNumber(statementWidth, "statementWidthInputBox");
            if (statementWidth > 180) {
                statementWidth = 180;
            } else if (statementWidth < -180) {
                statementWidth = -180;
            }
            vizConfig.statementWidth = statementWidth;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#lineSpacingInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var lineSpacing = $('#lineSpacingInputBox').val();
            UTIL.checkIfValueIsNumber(lineSpacing, "lineSpacingInputBox");
            if (lineSpacing > 500) {
                lineSpacing = 500;
            } else if (lineSpacing < 4) {
                lineSpacing = 4;
            }
            vizConfig.lineSpacing = lineSpacing;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#trimStatementsInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var trimStatementSize = $('#trimStatementsInputBox').val();
            UTIL.checkIfValueIsNumber(trimStatementSize, "trimStatementsInputBox");
            if (trimStatementSize > 3000) {
                trimStatementSize = 3000;
            } else if (trimStatementSize < 1) {
                trimStatementSize = 1;
            }
            vizConfig.trimStatementSize = trimStatementSize;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#setAsianLengthInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var asianStatmentLength = $('#setAsianLengthInputBox').val();
            UTIL.checkIfValueIsNumber(asianStatmentLength, "setAsianLengthInputBox");
            if (asianStatmentLength > 300) {
                asianStatmentLength = 300;
            } else if (asianStatmentLength < 2) {
                asianStatmentLength = 2;
            }
            vizConfig.asianStatmentLength = asianStatmentLength;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#symbolFontSizeInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var sigSymbolFontSize = $('#symbolFontSizeInputBox').val();
            UTIL.checkIfValueIsNumber(sigSymbolFontSize, "symbolFontSizeInputBox");
            if (sigSymbolFontSize > 80) {
                sigSymbolFontSize = 80;
            } else if (sigSymbolFontSize < 2) {
                sigSymbolFontSize = 2;
            }
            vizConfig.sigSymbolFontSize = sigSymbolFontSize;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $("#vizPanelHideContainer").on('change', 'input[type=color]', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var hexCode2 = $(this).val();
            vizConfig[$(this).attr('name')] = hexCode2;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#backgroundColorCutoffInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var backgroundColorCutoff = $('#backgroundColorCutoffInputBox').val();
            UTIL.checkIfValueIsNumber(backgroundColorCutoff, "backgroundColorCutoffInputBox");
            if (backgroundColorCutoff >= 100) {
                backgroundColorCutoff = 99;
            }
            vizConfig.backgroundColorCutoff = backgroundColorCutoff;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $('#customNameInputBox').on('input', function () {
            var vizConfig = QAV.getState("vizConfig") || {};
            var customName = $('#customNameInputBox').val();
            vizConfig.customName = customName;
            QAV.setState("vizConfig", vizConfig);
        });
    })();

    (function () {
        $("#clearStorageButton").on("click", function () {
            VIEW.showDeleteKenqData();
        });
    })();

    (function () {
        $("#deleteLocalDataModal").on("click", '#deleteLocalDataConfirmButton', function () {
            localStorage.clear();
            console.log("all localStorage cleared");
            sessionStorage.clear();
            VIEW.showlocalDataDeleteSuccessModal();
        });
    })();

    (function () {
        $('#deleteLocalDataModal').on("click", '.button-cancel', function () {
            $('#deleteLocalDataModal').iziModal('close');
        });
    })();


    (function () {
        $("#downloadConfirmModal").on('click', '#downloadAllImagesConfirmButton', function () {
            $("#downloadConfirmModal").iziModal('close');
            PRELIMOUT.downloadAllImages();
        });
    })();

    (function () {
        $("#downloadConfirmModal").on('click', '#downloadAllImagesPngConfirmButton', function () {
            $("#downloadConfirmModal").iziModal('close');
            PRELIMOUT.downloadAllPngImages();
        });
    })();

    (function () {
        $('#downloadConfirmModal').on("click", '#cancelButton', function () {
            $('#downloadConfirmModal').iziModal('close');
        });
    })();

}(window.CONTROLERS = window.CONTROLERS || {}, QAV));