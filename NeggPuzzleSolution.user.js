// ==UserScript==
// @name         Negg Puzzle Solution
// @description  These puzzles are so boring that it was more fun to wrote a solver.
// @version      0.9
// @author       Flutterz
// @match        https://www.neopets.com/shenkuu/neggcave/index.phtml
// @grant        none
// ==/UserScript==



//Set removeGapsInClues to false if you don't want the gaps in the clues to be replaced with blank spaces for better readability
const removeGapsInClues = true;


//Set lazyMode to true if you just want the solution visible immediately without trying to solve it yourself
const lazyMode = false;


//Set spoilerMode to false if you don't want the "Show Solution" button to say "Show Solutions" if there's multiple possible solutions
const spoilerMode = true;











//Actual code starts here

//Global stuff that needs to persist
var clues3x3 = [];
var clues3x2 = [];
var clues2x3 = [];
var clues2x2 = [];
var clues3x1 = [];
var clues1x3 = [];
var clues2x1 = [];
var clues1x2 = [];
var solutions = [];
var cluesClass = [];
var solutionDisplayed = false;
//Scary debug mode, fills the console with junk
var debugMode = false;

//Call main function then either output solution immediately or add the button to do so later
getClues();
if (cluesClass.length>0){
    if (lazyMode) {
        outputSolutions();
    } else {
        addButton();
    }
}

function getClues(){
    //Get all clues as html elements
    debugConsole("Getting clues");
    cluesClass = document.getElementsByClassName("mnc_clue_table");
    debugConsole(cluesClass[0]);
    var clues = [];
    //Abort if no clues found
    if (cluesClass.length==0){
        console.log("No clues! Puzzle didn't load or is already solved!");
        return;
    }

    //Fill in gaps with blank cells
    for (let i = 0; i < cluesClass.length; i++){
        clues.push(cluesClass[i].innerHTML.toString());
        while (clues[i].indexOf("<td class=\"empty\"></td>")>-1){
            clues[i] = clues[i].replace("<td class=\"empty\"></td>","<td><div class=\"mnc_negg_clue_cell mnc_negg_clue_sXcX\"></div></td>");
            if (removeGapsInClues)cluesClass[i].innerHTML = cluesClass[i].innerHTML.toString().replace("<td class=\"empty\"></td>","<td><div class=\"mnc_negg_clue_cell mnc_negg_clue_sXcX\"></div></td>");
        }
    }


    for (let i = 0; i < clues.length; i++) {
        debugConsole(clues[i]);
        var rows = 0;
        var cols = 0;
        var clueString = "";
        var parseClue = clues[i];
        //Extract important bits from clues
        while (parseClue.indexOf("<tr>")>-1){
            rows++;
            var colsTemp = 0;
            parseClue = parseClue.substring(parseClue.indexOf("<tr>")+6);
            var thisRow = "";
            if (parseClue.indexOf("<tr>")>-1){
                thisRow = parseClue.substring(0,parseClue.indexOf("<tr>"));
            } else {
                thisRow = parseClue;
            }
            while (thisRow.indexOf("mnc_negg_clue_cell mnc_negg_clue_")>-1){
                colsTemp++;
                thisRow = thisRow.substring(thisRow.indexOf("mnc_negg_clue_cell mnc_negg_clue_")+33);
                clueString = clueString + thisRow.substring(0,4);
                //debugConsole(thisRow);
            }
            clueString = clueString+"\n";
            if (colsTemp > cols) cols = colsTemp;

        }
        debugConsole("Columns : "+cols+", Rows: "+rows);
        debugConsole(clueString);
        //Save parsed clue to appropriate array
        if (rows+cols==6){
            clues3x3.push(clueString);
        } else if (rows+cols==5){
            if (rows==3){
                clues2x3.push(clueString);
            } else {
                clues3x2.push(clueString);
            }
        } else if (rows+cols==4){
            if (rows == 1){
                clues3x1.push(clueString);
            } else if (rows == 2){
                clues2x2.push(clueString);
            } else {
                clues1x3.push(clueString);
            }
        } else if (rows+cols==3){
            if (rows==2){
                clues1x2.push(clueString);
            } else {
                clues2x1.push(clueString);
            }
        }

    }
    combineClues();
}


function combineClues(){
    //Put all the fixed 3x3 clues on the board
    debugConsole("Combining clues");
    var mainGrid = [["sXcX","sXcX","sXcX"],["sXcX","sXcX","sXcX"],["sXcX","sXcX","sXcX"]];
    if (clues3x3.length>0){
        mainGrid = fillGrid(clues3x3[0],0,0);
        if (clues3x3.length>1){
            for (let i = 1; i < clues3x3.length;i++){
                mainGrid = addGrids(mainGrid,fillGrid(clues3x3[i],0,0));
            }
        }
    }

    //Start applying smaller clues that aren't fixed
    try3x2(mainGrid,0);
}


function try3x2(mainGrid,num){
    //Apply each 3x2 clue to each possible position, recursively call self and then 2x3 function
    if (num < clues3x2.length){
        var try1 = fillGrid(clues3x2[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try3x2(try1,num+1);
        }

        var try2 = fillGrid(clues3x2[num],0,1);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try3x2(try2,num+1);
        }
    } else {
        try2x3(mainGrid,0);
    }

}

function try2x3(mainGrid,num){
    //Same as above
    if (num < clues2x3.length){
        var try1 = fillGrid(clues2x3[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try2x3(try1,num+1);
        }

        var try2 = fillGrid(clues2x3[num],1,0);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try2x3(try2,num+1);
        }
    } else {
        try2x2(mainGrid,0);
    }

}

function try2x2(mainGrid,num){
    //Same as above
    if (num < clues2x2.length){
        var try1 = fillGrid(clues2x2[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try2x2(try1,num+1);
        }

        var try2 = fillGrid(clues2x2[num],0,1);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try2x2(try2,num+1);
        }

        var try3 = fillGrid(clues2x2[num],1,0);
        if (fitGrids(mainGrid,try3)){
            try3 = addGrids(mainGrid,try3);
            try2x2(try3,num+1);
        }

        var try4 = fillGrid(clues2x2[num],1,1);
        if (fitGrids(mainGrid,try4)){
            try4 = addGrids(mainGrid,try4);
            try2x2(try4,num+1);
        }
    } else {
        try3x1(mainGrid,0);
    }

}

function try3x1(mainGrid,num){
    //Same as above
    if (num < clues3x1.length){
        var try1 = fillGrid(clues3x1[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try3x1(try1,num+1);
        }

        var try2 = fillGrid(clues3x1[num],0,1);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try3x1(try2,num+1);
        }

        var try3 = fillGrid(clues3x1[num],0,2);
        if (fitGrids(mainGrid,try3)){
            try3 = addGrids(mainGrid,try3);
            try3x1(try3,num+1);
        }
    } else {
        try1x3(mainGrid,0);
    }

}

function try1x3(mainGrid,num){
    //Same as above
    if (num < clues1x3.length){
        var try1 = fillGrid(clues1x3[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try1x3(try1,num+1);
        }

        var try2 = fillGrid(clues1x3[num],1,0);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try1x3(try2,num+1);
        }

        var try3 = fillGrid(clues1x3[num],2,0);
        if (fitGrids(mainGrid,try3)){
            try3 = addGrids(mainGrid,try3);
            try1x3(try3,num+1);
        }
    } else {
        try2x1(mainGrid,0);
    }

}

function try2x1(mainGrid,num){
    //Same as above
    if (num < clues2x1.length){
        var try1 = fillGrid(clues2x1[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try2x1(try1,num+1);
        }

        var try2 = fillGrid(clues2x1[num],0,1);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try2x1(try2,num+1);
        }

        var try3 = fillGrid(clues2x1[num],0,2);
        if (fitGrids(mainGrid,try3)){
            try3 = addGrids(mainGrid,try3);
            try2x1(try3,num+1);
        }

        var try4 = fillGrid(clues2x1[num],1,0);
        if (fitGrids(mainGrid,try4)){
            try4 = addGrids(mainGrid,try4);
            try2x1(try4,num+1);
        }

        var try5 = fillGrid(clues2x1[num],1,1);
        if (fitGrids(mainGrid,try5)){
            try5 = addGrids(mainGrid,try5);
            try2x1(try5,num+1);
        }

        var try6 = fillGrid(clues2x1[num],1,2);
        if (fitGrids(mainGrid,try6)){
            try6 = addGrids(mainGrid,try6);
            try2x1(try6,num+1);
        }
    } else {
        try1x2(mainGrid,0);
    }

}

function try1x2(mainGrid,num){
    //Same as above
    if (num < clues1x2.length){
        var try1 = fillGrid(clues1x2[num],0,0);
        if (fitGrids(mainGrid,try1)){
            try1 = addGrids(mainGrid,try1);
            try1x2(try1,num+1);
        }

        var try2 = fillGrid(clues1x2[num],0,1);
        if (fitGrids(mainGrid,try2)){
            try2 = addGrids(mainGrid,try2);
            try1x2(try2,num+1);
        }

        var try3 = fillGrid(clues1x2[num],1,0);
        if (fitGrids(mainGrid,try3)){
            try3 = addGrids(mainGrid,try3);
            try1x2(try3,num+1);
        }

        var try4 = fillGrid(clues1x2[num],1,1);
        if (fitGrids(mainGrid,try4)){
            try4 = addGrids(mainGrid,try4);
            try1x2(try4,num+1);
        }

        var try5 = fillGrid(clues1x2[num],2,0);
        if (fitGrids(mainGrid,try5)){
            try5 = addGrids(mainGrid,try5);
            try1x2(try5,num+1);
        }

        var try6 = fillGrid(clues1x2[num],2,1);
        if (fitGrids(mainGrid,try6)){
            try6 = addGrids(mainGrid,try6);
            try1x2(try6,num+1);
        }
    } else {
        solvePuzzle(mainGrid);
    }

}

function solvePuzzle(mainGrid){
    //At this point all clues have been combined in a non-contradicting way, so go through and fill in the third of a shape or color where possible
    debugConsole("Attempting to solve "+mainGrid);
    var changed = false;
    var shape0 = [];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (mainGrid[i][j].substring(0,2)=="s0"){
                shape0.push(mainGrid[i][j]);
            }
        }
    }
    //Near-identical function 6 times cause I was too lazy to generalize string manipulation
    //Fill in missing shield
    if (shape0.length > 3) return;
    if (shape0.length == 3&&shape0.indexOf("s0cX")!=-1&&shape0.indexOf("s0cX")==shape0.lastIndexOf("s0cX")){
        if (shape0.indexOf("s0c0")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s0cX")mainGrid[i][j]="s0c0";
                    changed = true;
                }
            }
        } else if (shape0.indexOf("s0c1")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s0cX")mainGrid[i][j]="s0c1";
                    changed = true;
                }
            }
        } else {
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s0cX")mainGrid[i][j]="s0c2";
                    changed = true;
                }
            }
        }
    }
    //Fill in missing flame
    shape0 = [];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (mainGrid[i][j].substring(0,2)=="s1"){
                shape0.push(mainGrid[i][j]);
            }
        }
    }
    if (shape0.length > 3) return;
    if (shape0.length == 3&&shape0.indexOf("s1cX")!=-1&&shape0.indexOf("s1cX")==shape0.lastIndexOf("s1cX")){
        if (shape0.indexOf("s1c0")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s1cX")mainGrid[i][j]="s1c0";
                    changed = true;
                }
            }
        } else if (shape0.indexOf("s1c1")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s1cX")mainGrid[i][j]="s1c1";
                    changed = true;
                }
            }
        } else {
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s1cX")mainGrid[i][j]="s1c2";
                    changed = true;
                }
            }
        }
    }
    //Fill in missing squiggle
    shape0 = [];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (mainGrid[i][j].substring(0,2)=="s2"){
                shape0.push(mainGrid[i][j]);
            }
        }
    }
    if (shape0.length > 3) return;
    if (shape0.length == 3&&shape0.indexOf("s2cX")!=-1&&shape0.indexOf("s2cX")==shape0.lastIndexOf("s2cX")){
        if (shape0.indexOf("s2c0")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s2cX")mainGrid[i][j]="s2c0";
                    changed = true;
                }
            }
        } else if (shape0.indexOf("s2c1")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s2cX")mainGrid[i][j]="s2c1";
                    changed = true;
                }
            }
        } else {
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="s2cX")mainGrid[i][j]="s2c2";
                    changed = true;
                }
            }
        }
    }
    //Fill in missing blue
    shape0 = [];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (mainGrid[i][j].substring(2)=="c0"){
                shape0.push(mainGrid[i][j]);
            }
        }
    }
    if (shape0.length > 3) return;
    if (shape0.length == 3&&shape0.indexOf("sXc0")!=-1&&shape0.indexOf("sXc0")==shape0.lastIndexOf("sXc0")){
        if (shape0.indexOf("s0c0")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc0")mainGrid[i][j]="s0c0";
                    changed = true;
                }
            }
        } else if (shape0.indexOf("s1c0")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc0")mainGrid[i][j]="s1c0";
                    changed = true;
                }
            }
        } else {
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc0")mainGrid[i][j]="s2c0";
                    changed = true;
                }
            }
        }
    }
    //Fill in missing red
    shape0 = [];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (mainGrid[i][j].substring(2)=="c1"){
                shape0.push(mainGrid[i][j]);
            }
        }
    }
    if (shape0.length > 3) return;
    if (shape0.length == 3&&shape0.indexOf("sXc1")!=-1&&shape0.indexOf("sXc1")==shape0.lastIndexOf("sXc1")){
        if (shape0.indexOf("s0c1")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc1")mainGrid[i][j]="s0c1";
                    changed = true;
                }
            }
        } else if (shape0.indexOf("s1c1")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc1")mainGrid[i][j]="s1c1";
                    changed = true;
                }
            }
        } else {
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc1")mainGrid[i][j]="s2c1";
                    changed = true;
                }
            }
        }
    }
    //Fill in missing yellow
    shape0 = [];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (mainGrid[i][j].substring(2)=="c2"){
                shape0.push(mainGrid[i][j]);
            }
        }
    }
    if (shape0.length > 3) return;
    if (shape0.length == 3&&shape0.indexOf("sXc2")!=-1&&shape0.indexOf("sXc2")==shape0.lastIndexOf("sXc2")){
        if (shape0.indexOf("s0c2")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc2")mainGrid[i][j]="s0c2";
                    changed = true;
                }
            }
        } else if (shape0.indexOf("s1c2")==-1){
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc2")mainGrid[i][j]="s1c2";
                    changed = true;
                }
            }
        } else {
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXc2")mainGrid[i][j]="s2c2";
                    changed = true;
                }
            }
        }
    }

    //Recurse until no more deductions can be made, then verify if solution is valid
    if (changed){
        solvePuzzle(mainGrid);
    } else {
        verifySolution(mainGrid);
    }

}

function verifySolution(mainGrid){
    debugConsole("Verifying solution "+mainGrid);
    //Remove all shape-color combos in the solution from the full list of combos + blank
    var alls = ["s0c0","s0c1","s0c2","s1c0","s1c1","s1c2","s2c0","s2c1","s2c2","sXcX"];
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            var ind = alls.indexOf(mainGrid[i][j]);
            if (ind!=-1)alls.splice(ind,1);
        }
    }
    //If the solution is valid this should leave exactly 1 in the list - either the blank, or a single combo which goes in the place of the blank in the solution
    var solved = false;
    if (alls.length==1){
        if (alls[0]=="sXcX"){
            solved = true;
        } else {
            //If the leftover is a combo, put it into the solution's blank
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    if (mainGrid[i][j]=="sXcX")mainGrid[i][j]=alls[0];
                }
            }
            solved = true;
        }

    }

    if (solved){
        debugConsole("Solution found!");
        debugConsole(mainGrid);
        addSolution(mainGrid);
    }else {
        debugConsole("Solution invalid!");
    }
}

function outputSolutions(){
    if (!solutionDisplayed){
        solutionDisplayed = true;
        //Put some stuff in the console as a treat
        debugConsole("=======================================");
        debugConsole("=======================================");
        if (solutions.length > 0){
            debugConsole("PUZZLE SOLUTIONS FOUND:");
            //Replace all the clues with empty junk
            for (let i = 0; i < cluesClass.length;i++){
                cluesClass[i].innerHTML = "<table class=\"mnc_clue_table\"></table>";
            }
            //Put the solution(s) where the clues were
            if (solutions.length == 1){
                cluesClass[0].innerHTML = "<center>Solution:</center>"+convertToReadable(solutions[0]);
            } else {
                for (let i = 0; i < solutions.length;i++){
                    var cnt = i+1;
                    cluesClass[i].innerHTML = "<center>Solution "+cnt+":</center>"+convertToReadable(solutions[i]);
                }
            }

        } else {
            debugConsole("NO SOLUTIONS FOUND!");
        }
    }

}

function addButton(){
    //Gross css style sheet that took like an hour to get right, probably half of it does nothing at this point but I'm not touching this mess
    document.head.appendChild(document.createElement("style")).innerHTML =`
        .custombutton {
            background: url(https://images.neopets.com/shenkuu/neggcave/buttons_puzzle.png) -164px 0px no-repeat;
            height: 25px;
            width: 140px;
            margin: 2px;
            margin-left: 110px;
            margin-top:520px;
            cursor:pointer;
            display: inline-flex;
            align-items: center;
            text-align: center;
        }
        .custombutton:hover {
            background-position: -164px -26px;
        }
        `;
    //If spoilerMode is on and there are multiple solutions, button says Show Solutions, otherwise just Show Solution
    if ((solutions.length > 1)&&(spoilerMode)){
        document.head.appendChild(document.createElement("style")).innerHTML =`
        .customtext {
            height: 25px;
            width: 140px;
            background: url('data:image/png;base64,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') 0px 0px no-repeat;
        }
        `;
    } else {
        document.head.appendChild(document.createElement("style")).innerHTML =`
        .customtext {
            height: 25px;
            width: 140px;
            background: url('data:image/png;base64,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') 0px 0px no-repeat;
        }
        `;
    }
    //Create button, make it output the found solutions
    var buttonArea = document.getElementById("mnc_parch");
    debugConsole("Button goes here");
    debugConsole(buttonArea);
    let btn = document.createElement("div");
    btn.classList.add("custombutton");
    let txt = document.createElement("div");
    txt.classList.add("customtext");
    btn.appendChild(txt);
    btn.onclick = () => {
        outputSolutions();
    };
    debugConsole(btn);
    buttonArea.appendChild(btn);
}

function fillGrid(a,x,y){
    //Input string parsed from clue and x y coords from top left, output matrix grid of blank cells with clue placed at coords
    debugConsole("Filling " + a + " at " + x + "," + y);
    var temp = a;
    var rows=[];
    //Split string by row
    while (temp.indexOf("\n")>-1){
        rows.push(temp.substring(0,temp.indexOf("\n")));
        temp = temp.substring(temp.indexOf("\n")+1);
    }
    //Create empty grid and place each row at the appropriate position
    var grid = [["sXcX","sXcX","sXcX"],["sXcX","sXcX","sXcX"],["sXcX","sXcX","sXcX"]];
    var row = 0;
    for (let i = y; i < rows.length+y; i++){
        var j = x;
        while (rows[row]!=""){
            grid[i][j]=rows[row].substring(0,4);
            rows[row]=rows[row].substring(4);
            j++;
        }
        row++;
    }
    debugConsole(grid);
    return grid;
}

function fitGrids(a,b){
    //Makes sure that 2 grids are non-contradictory
    debugConsole("Fitting grids " + a + " AND " + b);
    var fit = true;
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (!(a[i][j].substring(0,2)==b[i][j].substring(0,2)||a[i][j].substring(0,2)=="sX"||b[i][j].substring(0,2)=="sX")){
                fit = false;
            }
            if (!(a[i][j].substring(2)==b[i][j].substring(2)||a[i][j].substring(2)=="cX"||b[i][j].substring(2)=="cX")){
                fit = false;
            }
        }
    }
    debugConsole("Fit: "+fit);
    return fit;
}

function addGrids(a,b){
    //Combine two grids, does not check if grids contradict so do that first
    debugConsole("Adding grids " + a + " AND " + b);
    var out = [["","",""],["","",""],["","",""]];
    //If both are blank output blank, if one is a shape or color output that
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            if (a[i][j].substring(0,2)!="sX"){
                out[i][j]=a[i][j].substring(0,2);
            } else {
                out[i][j]=b[i][j].substring(0,2);
            }
            if (a[i][j].substring(2)!="cX"){
                out[i][j]=out[i][j]+a[i][j].substring(2);
            } else {
                out[i][j]=out[i][j]+b[i][j].substring(2);
            }
        }
    }
    debugConsole(out);
    return out;
}

function convertToReadable(mainGrid){
    //Convert a solution grid to plaintext for console output and to html to put it back onto the page
    debugConsole("Converting to readable");
    var alls = ["s0c0","s0c1","s0c2","s1c0","s1c1","s1c2","s2c0","s2c1","s2c2"];
    var readable = ["Blue Shield","Red Shield","Yellow Shield","Blue Flame","Red Flame","Yellow Flame","Blue Squiggle","Red Squiggle","Yellow Squiggle"];

    //All the html for a solution grid but with "imgx" where each cell goes for easy substitution
    var solutionTemplate = "<table class=\"mnc_clue_table\"><tbody><tr><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img1\"></div></td><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img2\"></div></td><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img3\"></div></td></tr><tr><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img4\"></div></td><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img5\"></div></td><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img6\"></div></td></tr><tr><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img7\"></div></td><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img8\"></div></td><td><div class=\"mnc_negg_clue_cell mnc_negg_clue_img9\"></div></td></tr></tbody></table>";
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            var count = 3*i+j+1;
            count = "img"+count;
            solutionTemplate = solutionTemplate.replace(count,mainGrid[i][j]);

            var ind = alls.indexOf(mainGrid[i][j]);
            mainGrid[i][j] = readable[ind];
        }
    }
    debugConsole(mainGrid);
    return solutionTemplate;
}

function addSolution(mainGrid){
    //Check if solution has already been found before adding
    var dupe = false;
    for (let i = 0; i < solutions.length; i++){
        if (mainGrid.toString()==solutions[i])dupe = true;
    }
    if (!dupe) solutions.push(mainGrid);
}


function debugConsole(logIn){
    //Off switch for all the console.logs I dropped all over the place
    if (debugMode) console.log(logIn);
}
