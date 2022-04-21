const os = require("os");
const child_process = require("child_process");
const zip = require("jszip");
const axios = new (require("axios").Axios)({});
const fs = require("fs")

const package = require("./package.json");

function run(cmd) {
    var out = "";
    try {
        out = child_process.execSync(cmd);
    }catch(err) {
        out = err.stdout;
    }
    return out.toString();
}

/**
 * 
 * @param {String} url 
 * @returns {Promise<ArrayBuffer>}
 */
function download(url) {
    return new Promise((res,rej)=>{
        axios.get(url,{responseType:"arraybuffer"})
            .then(r=>res(r.data))
            .catch(rej)
    })
}

switch(os.platform()) {
    case "linux": {
        var zenityExists = run("/usr/bin/which zenity") !== "";
        if(!zenityExists) {
            if(run("/usr/bin/which pkexec")!=="") {
                var package_manager = null;

                switch(null) {
                    case run("/usr/bin/which apt")!=="":package_manager = "apt install";break;
                    case run("/usr/bin/which pacman")!=="":package_manager = "pacman -S";break;
                    case run("/usr/bin/which emerge")!=="":package_manager = "emerge";break;
                    case run("/usr/bin/which yum")!=="":package_manager = "yum install";break;
                    case run("/usr/bin/which apk")!=="":package_manager = "apk add";break;
                }
                if(package_manager) {
                    run(`pkexec ${package_manager} zenity`);
                    console.log("Done");
                }else{
                    console.log("Please install zenity manually using your package manager.")
                }
            }else{
                console.log("Please install zenity manually using your package manager.")
            }
        }
        break;
    }
    case "win32":
    case "darwin":{
        var name = `zenity_${(os.platform()=="win32")?(os.arch()=="x64"?"win64":"win32"):"macos"}.zip`;
        var filename = os.platform()=="win32"?"zenity.exe":"zenity";
        download("https://api.github.com/repos/ncruces/zenity/releases/latest").then(releases=>{
            var url = JSON.parse(Buffer.from(releases).toString()).assets.find(v=>v.name==name).browser_download_url;
            console.log("Downloading zenity from: "+url)
            download(url).then(zipFile=>{
                zip.loadAsync(zipFile).then(unzipped=>{
                    unzipped.files[filename].nodeStream().pipe(fs.createWriteStream(filename));
                })
            })
        })
        break;
    }
}