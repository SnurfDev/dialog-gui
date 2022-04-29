var child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { platform } = require("os");

const zenityBin = fs.existsSync(path.join(__dirname,platform()=="win32"?"zenity.exe":"zenity"))?((platform()=="win32")?".\\zenity.exe":"./zenity"):"zenity";

function run(cmd) {
    var out = "";
    try {
        out = child_process.execSync(cmd);
    }catch(err) {
        out = err.stdout;
    }
    return out.toString();
}
/** @returns {Promise<string>} */
function runAsync(cmd) {
    return new Promise(res=>{
        child_process.exec(cmd,(_,out)=>{
            res(out.toString());
        })
    })
}

/**
 * @typedef WindowOptions
 * @type {{
 *      icon?:String,
 *      width?:Number,
 *      height?:Number,
 *      parent?:String
 * }}
 */



class Progress {
    /**
     * 
     * @param {String} args 
     */
    constructor(args) {
        var cmd = [zenityBin,"--progress","--auto-close",...args];
        this._process = child_process.exec(cmd.join(" "));
    }
    /**
     * 
     * @param {Number} percentage 
     */
    progress(percentage) {
        this._process.stdin.write(`${percentage.toFixed(0)}\n`);
    }
}


class Dialog {
    command=[zenityBin]
    /** @type {String[]} */
    returnForms=[]
    /**
     * 
     * @param {String} title 
     * @param {WindowOptions} [options] 
     */
    constructor(title,options) {
        if(os.platform()!=="linux") throw new Error("The Dialog class is currently not supported on operating systems other than linux. Static fields work though.")
        this.command.push(`--title="${title}"`);

        if(options) {
            if(options.height) this.command.push(`--height="${options.height}"`);
            if(options.width) this.command.push(`--width="${options.width}"`);
            if(options.icon) this.command.push(`--window-icon="${options.icon}"`);
            if(options.parent) this.command.push(`--attach="${options.parent}"`);
        }

        this.command.push("--forms");
        this.command.push(`--text="${title}"`);
    }

    /**
     * 
     * @param {String} id 
     * @param {String} [name] 
     * @returns 
     */
    entry(id,name) {
        this.returnForms.push(id);
        this.command.push(`--add-entry="${name||"entry"}"`);
        return this;
    }

    /**
     * 
     * @param {String} id 
     * @param {String} [name] 
     * @returns 
     */
    password(id,name) {
        this.returnForms.push(id);
        this.command.push(`--add-password="${name||"password"}"`);
        return this;
    }
    
    /**
     * 
     * @param {String} id 
     * @param {String} [name] 
     * @returns 
     */
    calendar(id,name) {
        this.returnForms.push(id);
        this.command.push(`--add-calendar="${name||"calendar"}"`);
        return this;
    }
    
    /**
     * Deprecated. Use Dialog.list() [static] if possible because of graphical glitches
     * @param {String} id 
     * @param {String} name 
     * @param {String[]|String[][]} values
     * @param {String[]} [headers]
     * @deprecated 
     * @returns 
     */
    list(id,name,values,headers=null) {
        this.returnForms.push(id);
        this.command.push(`--add-list="${name||"list"}"`);

        var listvals = "";
        var columns = values[values.length-1].join?values[values.length-1].length:null;
        if(columns) {
            listvals = values.map(v=>v.join("|")).join("|")
        }else{
            listvals = values.join("|");
        }
        this.command.push(`--list-values="${listvals}"`);
        if(headers) {
            this.command.push(`--column-values="${headers.join("|")}"`);
            this.command.push("--show-header")
        }else if(columns){
            this.command.push(`--column-values="${new Array(columns).fill("     ").join("|")}"`);
        }
        return this;
    }

    /**
     * 
     * @param {String} id 
     * @param {String} name
     * @param {String[]} values
     * @returns 
     */
    combo(id,name,values) {
        this.returnForms.push(id);
        this.command.push(`--add-combo="${name||"combo"}"`);
        this.command.push(`--combo-values="${values?values.join("|"):"combo_value"}"`);
        return this;
    }

    /**
     * Add custom args to the zenity command (Only use if you know what you're doing)
     * @param {String[]} args 
     * @returns 
     */
    customArgs(args) {
        this.command.push(...args);
        return this;
    }

    /**
     * @returns {{[x:String]:String}|null}
     */
    show() {
        var ret = run(this.command.join(" "));

        if(ret.endsWith("\n")) {
            var retobj = {};
            ret.slice(0,(os.platform()=="win32")?out.length-2:out.length-1).split("|").forEach((value,i)=>{
                var id = this.returnForms[i];
                retobj[id] = value;
            });
            return retobj;
        }else{
            return null;
        }
    }

    /**
     * @returns {Promise<{[x:String]:String}|null>}
     */
    async showAsync() {
        var ret = await runAsync(this.command.join(" "));

        if(ret.endsWith("\n")) {
            var retobj = {};
            ret.slice(0,(os.platform()=="win32")?out.length-2:out.length-1).split("|").forEach((value,i)=>{
                var id = this.returnForms[i];
                retobj[id] = value;
            });
            return retobj;
        }else{
            return null;
        }
    }



    static notify(msg) {
        runAsync(`${zenityBin} --notification --text="${msg}"`);
    }

    /**
     * 
     * @param {"file"|"directory"} type 
     * @param {boolean} multiple 
     * @param {String} save save file name or null
     */
    static file(type="file",multiple=false,save=null) {
        var cmd = [zenityBin,"--file-selection"];
        if(type=="directory") cmd.push("--directory");
        if(multiple) cmd.push("--multiple");
        if(save) cmd.push("--save",`--filename="${save}"`,"--confirm-overwrite");
        var out = run(cmd.join(" "));
        return out.slice(0,(os.platform=="win32")?out.length-2:out.length-1);
    }

    /**
     * 
     * @param {String} text 
     * @param {String} title 
     * @param {"info"|"error"|"question"} type
     * @param {WindowOptions} [options] 
     */
    static info(text,title,type="info",options) {
        var cmd = [zenityBin,`--${type}`];
        if(options) {
            if(options.height) cmd.push(`--height="${options.height}"`);
            if(options.width) cmd.push(`--width="${options.width}"`);
            if(options.icon) cmd.push(`--window-icon="${options.icon}"`);
            if(options.parent) cmd.push(`--attach="${options.parent}"`);
        }
        cmd.push(`--text="${text||"text"}"`);
        cmd.push(`--title="${title||"title"}"`);
        run(cmd.join(" "));
    }

    /**
     * 
     * @param {String} text 
     * @param {String} title 
     * @param {String} [placeholder] 
     * @param {WindowOptions} [options] 
     * @returns 
     */
    static entry(text,title,placeholder=null,options) {
        var cmd = [zenityBin,`--entry`];
        if(options) {
            if(options.height) cmd.push(`--height="${options.height}"`);
            if(options.width) cmd.push(`--width="${options.width}"`);
            if(options.icon) cmd.push(`--window-icon="${options.icon}"`);
            if(options.parent) cmd.push(`--attach="${options.parent}"`);
        }
        cmd.push(`--text="${text||"text"}"`);
        cmd.push(`--title="${title||"title"}"`);
        if(placeholder) cmd.push(`--entry-text="${placeholder}"`)
        var out = run(cmd.join(" "));
        return out?out.slice(0,(os.platform()=="win32")?out.length-2:out.length-1):placeholder;
    }

    /**
     * 
     * @param {String} text 
     * @param {String} title 
     * @param {WindowOptions} [options] 
     */
    static password(text,title,options) {
        var cmd = [zenityBin,`--password`];
        if(options) {
            if(options.height) cmd.push(`--height="${options.height}"`);
            if(options.width) cmd.push(`--width="${options.width}"`);
            if(options.icon) cmd.push(`--window-icon="${options.icon}"`);
            if(options.parent) cmd.push(`--attach="${options.parent}"`);
        }
        cmd.push(`--text="${text||"text"}"`);
        cmd.push(`--title="${title||"title"}"`);
        var out = run(cmd.join(" "));
        return out?out.slice(0,(os.platform()=="win32")?out.length-2:out.length-1):placeholder;
    }

    /**
     * 
     * @param {String} text 
     * @param {String} title 
     * @param {WindowOptions} [options] 
     */
    static progress(text,title,options) {
        var cmd = [];
        if(options) {
            if(options.height) cmd.push(`--height="${options.height}"`);
            if(options.width) cmd.push(`--width="${options.width}"`);
            if(options.icon) cmd.push(`--window-icon="${options.icon}"`);
            if(options.parent) cmd.push(`--attach="${options.parent}"`);
        }
        cmd.push(`--text="${text||"text"}"`);
        cmd.push(`--title="${title||"title"}"`);
        return new Progress(cmd);
    }

    /**
     * 
     * @param {String} title 
     * @param {String} [color] 
     * @param {boolean} [palette] 
     * @param {WindowOptions} [options]
     */
    static color(title,color="#FFFFFF",palette=false,options) {
        var cmd = [zenityBin,"--color-selection"];
        if(options) {
            if(options.height) cmd.push(`--height="${options.height}"`);
            if(options.width) cmd.push(`--width="${options.width}"`);
            if(options.icon) cmd.push(`--window-icon="${options.icon}"`);
            if(options.parent) cmd.push(`--attach="${options.parent}"`);
        }
        if(palette) cmd.push("--palette");
        cmd.push(`--title="${title||"title"}"`,`--color="${color}"`);
        var out = run(cmd.join(" "));
        return (function rgbToHex(rgb) {
            function componentFromStr(numStr, percent) {
                var num = Math.max(0, parseInt(numStr, 10));
                return percent ?
                    Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
            }
            var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
            var result, r, g, b, hex = "";
            if ( (result = rgbRegex.exec(rgb)) ) {
                r = componentFromStr(result[1], result[2]);
                g = componentFromStr(result[3], result[4]);
                b = componentFromStr(result[5], result[6]);
            
                hex = "0x" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }
            return hex;
        })(out.slice(0,(os.platform=="win32")?out.length-2:out.length-1));
    }
    /**
     * 
     * @param {String} title 
     * @param {String} text 
     * @param {String[][]|String[]} values 
     * @param {String[]} [headers] 
     * @param {WindowOptions} [options] 
     */
    static list(title,text,values,headers,options) {
        var platform = os.platform();
        var cmd = [zenityBin,"--list"];
        cmd.push(`--text="${text||"text"}"`);
        cmd.push(`--title="${title||"title"}"`);
        if(options) {
            if(options.height) cmd.push(`--height="${options.height}"`);
            if(options.width) cmd.push(`--width="${options.width}"`);
            if(options.icon) cmd.push(`--window-icon="${options.icon}"`);
            if(options.parent) cmd.push(`--attach="${options.parent}"`);
        }
        
        var listvals = [];
        var columns = values[values.length-1].join?values[values.length-1].length:null;
        if(columns) {
            if(platform=="linux") {
                listvals = values.reduce((p,c)=>{c.forEach(v=>p.push(v));return p},[]);
            }else{
                listvals = values.map(v=>v.join("  "));
            }
            
        }else{
            listvals = values;
        }
        columns = columns || 1;
        if(!headers) {
            headers = new Array(columns).fill(`" "`);
        }
        if(platform=="linux") {
            cmd.push(...headers.map(v=>`--column="${v}"`));
        }else{
            cmd.push(`--column="${headers.join("  ")}"`);
            listvals.unshift(headers.join("  "))
        }
        
        cmd.push(...listvals.map(v=>`"${v}"`));
        var out = run(cmd.join(" "));
        if(!out) return null;
        return (listvals.indexOf(out.slice(0,(platform=="win32")?out.length-2:out.length-1))/((platform=="linux")?columns:1))-((platform=="linux")?0:1);
    }
}

module.exports = Dialog;