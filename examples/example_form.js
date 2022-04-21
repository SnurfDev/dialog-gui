/**
 * This is an example on how to use the Forms [LINUX ONLY]
 */

const Dialog = require("..");

var response = new Dialog("My Dialog",{width:100,height:400})
    .entry("name","Name") // Add an entry field
    .password("password","Password") // Add a password field
    .calendar("birthDate","Birth Date") // Add a calendar field
    .combo("gender","Gender",["Male","Female","Other"]) //Add a combo/selection box
    .show(); //Show the dialog

Dialog.info(
    `Hello ${response.name}, your gender is ${response.gender}. Your birth date is the ${response.birthDate} and your password is ${response.password}.` //text
    ,"Hello", // title
    "info", //window type
    {width:200} //set width
);