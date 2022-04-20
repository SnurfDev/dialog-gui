/**
 * This is an example of a small csv file editor I made using the dialogs
 */


const Dialog = require(".");
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
    var startDiag = new Dialog(title)
        .combo("selectType","Select action",["New File","Load File"])
        .entry("sep","Seperator")
        .show();
    if(!startDiag) return;

    
    //Get seperator
    var seperator = startDiag.sep||",";
    if(startDiag.selectType=="Load File") {
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
        var sizeDiag = new Dialog("Select Size")
            .entry("width","Columns")
            .entry("height","Rows")
            .show();
        if(!sizeDiag) return;
        //Parse width and height
        width = parseInt(sizeDiag.width);
        height = parseInt(sizeDiag.height);
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
        var squareSelector = new Dialog("Select column")
            .combo(
                "col",
                "Column",
                new Array(csv[selected].length).fill().map((_,i)=>String.fromCharCode(65+i))
            )
            .show();
        //Edit selected column
        if(squareSelector!==null) {
            var idx = squareSelector.col.charCodeAt()-65;
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