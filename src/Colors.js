'use strict';

// Dark theme, may be used to determine the preferences of a user.
//const prefersDarkMode = window.matchMedia("(prefers-color-scheme:dark)").matches;
// Preset theme
let colorTheme = 'WhiteTheme'; // The alternative
colorTheme = 'DarkTheme'; // The default
// colorTheme = 'WhiteTheme'; // Test

let backGroundCanvas = "#252525";
let borderBackground = '#333333';
let fontColor = "LightGray";

function changeColors() {

    if (colorTheme == 'DarkTheme') {
        borderBackground = '#333333';
        backGroundCanvas = "#252525";
        fontColor = "LightGray";
        //document.canvas.border.style.color = 'rgb(206, 206, 206)';
    }
    else {
        borderBackground = 'white';
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
        cols[i].style.backgroundColor = borderBackground;
        cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('FileMenu-content');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
        cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('diagramMenuButton');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
        cols[i].style.color = fontColor;
    }

    cols = document.getElementsByClassName('helpMenuButton');
    for (let i = 0; i < cols.length; i++) {
        cols[i].style.backgroundColor = borderBackground;
        cols[i].style.color = fontColor;
    } 

    let element = document.getElementById('contextMenu');
    element.style.setProperty("--menuBGColor", borderBackground); 
    element.style.color = fontColor;

    element = document.getElementById('pane');
    element.style.backgroundColor = backGroundCanvas;

/*     element = document.getElementById('FolderToSOMIXButton');
    element.style.backgroundColor = borderBackground;
    element.style.color = fontColor; */

}
