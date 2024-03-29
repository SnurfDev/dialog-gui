/**
 * This is an example of a small csv file editor I made using the static fields [WORKS ON WINDOWS/MAC]
 */


const Dialog = require("..");
const fs = require("fs");

const title = "CsvEdit";

/**
 * @type {String[][]}
 */
var csv;

function run() {
    var width = NaN;
    var height = NaN;
    
    //Show start dialog
    var startDiag = Dialog.list("Action","Select action",["New File","Load File"],["Action"])
    if(startDiag===null) return;
    
    //Get seperator
    var seperator = Dialog.entry("Input the CSV seperator character","Seperator",",");
    if(startDiag==1) {
        //Get file selector
        var file = Dialog.file();
        if(!file) {Dialog.info("Please select a valid file","Error","error");return run()}

        //Read file
        var data = fs.readFileSync(file).toString();

        //Process file contents
        csv = data.split("\n").filter(v=>v).map(v=>v.split(seperator));
        width = csv[csv.length-1].length;
        height = csv.length;

    }else{
        //Get csv size dialog
        width = parseInt(Dialog.entry("Width","Size","5"));
        height = parseInt(Dialog.entry("Height","Size","4"));
        if(width===NaN||height===NaN) {Dialog.info("The width or height inputed are invalid","Error","error");return run()}

        //Create empty table
        csv = new Array(height).fill().map(_=>new Array(width).fill(""));
    }
    console.log(csv);
    //Start editing loop
    while(true) {
        //Get selected row
        var selected = Dialog.list(
            "File view",
            "",
            csv.map((v,i)=>([i.toString(),...v])),
            new Array(width+1).fill().map((_,i)=>String.fromCharCode(64+i)),
            {width:100*width,height:150+25*height}
        );
        if(selected===null) break;

        //Get selected column
        var squareSelector = Dialog.list("Select Square","Select Square to Edit.",new Array(width+1).fill().map((_,i)=>String.fromCharCode(65+i)),["Column"])
        //Edit selected column
        if(squareSelector!==null) {
            var idx = squareSelector;
            csv[selected][idx] = Dialog.entry(`Edit ${squareSelector.col}${selected}:`,"Field editor",csv[selected][idx]);
        }
    }
    //Obtain the savefile path
    var savefile = Dialog.file("file",false,Dialog.entry("Enter a filename to save to","Save file","out.csv"))
    if(!savefile) return;

    //start a progress bar (for large files)
    var progress = Dialog.progress("Saving","Saving");

    //Save the file
    fs.writeFileSync(savefile,csv.map(v=>v.join(seperator)).join("\n"));

    //Update the progress bar
    progress.progress(100);

    //Tell the user that the operation has finished.
    Dialog.info("File saved!","Done");
}run();