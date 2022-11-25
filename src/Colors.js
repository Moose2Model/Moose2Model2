'use strict';

// Dark theme, may be used to determine the preferences of a user.
//const prefersDarkMode = window.matchMedia("(prefers-color-scheme:dark)").matches;
// Preset theme
let colorTheme = 'WhiteTheme'; // The alternative
colorTheme = 'DarkTheme'; // The default
// colorTheme = 'WhiteTheme'; // Test

let backGroundCanvas = "#252525";
let borderBackground = '#333333';
let highlightedBorderBackground = '#3f3f40';
let fontColor = "LightGray";
let menuBGColor = '#303031';
let menuHighlightedBGColor = '#21395e';
let menuSeparatorColor = 'gray';

function changeColors() {

    if (colorTheme == 'DarkTheme') {
        borderBackground = '#333333';
        highlightedBorderBackground = '#3f3f40';
        menuBGColor = '#303031';
        menuHighlightedBGColor = '#21395e';
        menuSeparatorColor = '#454545';
        backGroundCanvas = "#252525";
        fontColor = "LightGray";
        //document.canvas.border.style.color = 'rgb(206, 206, 206)';
    }
    else {
        borderBackground = 'white';
        highlightedBorderBackground = '#e9e9e9';
        menuBGColor = '#f9f9f9';
        menuHighlightedBGColor = '#dddddd';
        menuSeparatorColor = '#cccccc';
        backGroundCanvas = "white";
        fontColor = 'black';
        //document.canvas.border.style.color = 'rgb(206, 206, 206)';
    }

    document.body.style.backgroundColor = borderBackground;
    document.body.style.color = fontColor;

    let cols = document.getElementsByClassName('toprow');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground; //'gray';
    }

    cols = document.getElementsByClassName('myModelText');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
    }

    cols = document.getElementsByClassName('infoText');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
    }

    cols = document.getElementsByClassName('displayedDiagramText');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
    }

    cols = document.getElementsByClassName('activeDiagramText');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
    }



    cols = document.getElementsByClassName('navbar');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('fileMenuButton');
    for (let i = 0; i < cols.length; i++) {
        //cols[i].style.backgroundColor = borderBackground;
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.setProperty("--menuHighBGColor", highlightedBorderBackground);

        cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('FileMenu-content');
    for (let i = 0; i < cols.length; i++) {
        //cols[i].style.backgroundColor = borderBackground;
        cols[i].style.setProperty("--menuItemBGColor", menuBGColor);
        cols[i].style.setProperty("--menuItemHighBGColor", menuHighlightedBGColor);
        cols[i].style.setProperty("--fontColor", fontColor);
        //cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('DiagramMenu-content');
    for (let i = 0; i < cols.length; i++) {
        //cols[i].style.backgroundColor = borderBackground;
        cols[i].style.setProperty("--menuItemBGColor", menuBGColor);
        cols[i].style.setProperty("--menuItemHighBGColor", menuHighlightedBGColor);
        cols[i].style.setProperty("--fontColor", fontColor);
        //cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('HelpMenu-content');
    for (let i = 0; i < cols.length; i++) {
        //cols[i].style.backgroundColor = borderBackground;
        cols[i].style.setProperty("--menuItemBGColor", menuBGColor);
        cols[i].style.setProperty("--menuItemHighBGColor", menuHighlightedBGColor);
        cols[i].style.setProperty("--fontColor", fontColor);
        //cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('diagramMenuButton');
    for (let i = 0; i < cols.length; i++) {
        //cols[i].style.backgroundColor = borderBackground;
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.setProperty("--menuHighBGColor", highlightedBorderBackground);
        cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('helpMenuButton');
    for (let i = 0; i < cols.length; i++) {
        //cols[i].style.backgroundColor = borderBackground;
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.setProperty("--menuHighBGColor", highlightedBorderBackground);
        cols[i].style.color = fontColor;
    }

    let element = document.getElementById('contextMenu');
    element.style.setProperty("--menuItemBGColor", menuBGColor);
    element.style.setProperty("--menuItemHighBGColor", menuHighlightedBGColor);
    element.style.color = fontColor;

    element = document.getElementById('pane');
    element.style.backgroundColor = backGroundCanvas;

    // Chane color or separators for menus

    element = document.getElementById('LoadButton');
    element.style.borderColor = menuSeparatorColor;

    element = document.getElementById('OpenWorkFolderButton');
    element.style.borderColor = menuSeparatorColor;

    element = document.getElementById('ImportOldDiagramButton');
    element.style.borderColor = menuSeparatorColor;

    // Change color for input of data

    cols = document.getElementsByClassName('exploreModel');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.setProperty("--fontColor", fontColor);
    }

    cols = document.getElementsByClassName('newDiagramElement');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.setProperty("--fontColor", fontColor);
    }

    cols = document.getElementsByClassName('commentElement');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.setProperty("--menuBGColor", borderBackground);
        cols[i].style.setProperty("--fontColor", fontColor);
    }

}
