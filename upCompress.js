const fs = require("fs");
const path = require("path");
const compressing = require('compressing');
const { exec } = require('child_process');

const args = require('minimist')(process.argv.slice(2))
const dir_root = args['d'];
let count = 0;
function exe(dir_r, dir) {
    // if (dir_r == dir)
    //     console.log("\n", dir_r);

    const list_file = fs.readdirSync(dir);

    list_file.forEach(file => {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) {
            // exe(dir_r, path.join(dir, file));
            return;
        }

        if (!file.includes(".zstd") && !file.includes(".zip")) return;

        const file_new = file.replace(file, count + ".zip");
        const file_path = path.join(dir, file);
        const file_path_compress = path.join(dir, file_new);
        fs.renameSync(file_path, file_path_compress);

        const dir_path_uncompress = file_path_compress.replace(".zip", "");
        const file_path_wxapkg = path.join(dir_path_uncompress, count + ".wxapkg");
        console.log(file, file_path, file_path_compress, dir_path_uncompress);
        // uncompress a file
        compressing.tgz.uncompress(file_path_compress, dir_path_uncompress)
            .then((res) => {
                console.log("uncompress done");
                exec(`node wuWxapkg.js ${file_path_wxapkg}`, (err, std) => {
                    console.log("wuWxapkg:", file_path_wxapkg, err)
                });
            })
            .catch((err) => {
                console.log("uncompress err", err);
            });

        count++
    });
}

exe(dir_root, dir_root);