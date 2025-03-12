const fs = require("fs");
const path = require("path");
const Seven = require('node-7z');
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

        if (!file.includes(".zstd")) return;

        const file_path = path.join(dir, file);
        const dir_path_uncompress = file_path.replace(".zstd", "");
        const file_path_wxapkg = file_path.replace(".zstd", ".wxapkg");
        console.log(file, file_path, dir_path_uncompress);
        // uncompress a file
        const myTask = Seven.extractFull(file_path, dir, {
            $progress: true // 进度条
        });
        myTask.on('progress', progress => {
            console.log(`Progress: ${progress.percent}%`);
        });
        path.join(dir, "/ subpackage")
        myTask.on('end', () => {
            console.log('Extraction completed successfully!');
            fs.renameSync(dir_path_uncompress, file_path_wxapkg);
            exec(`node wuWxapkg.js ${file_path_wxapkg}`, (err, std) => {
                console.log("wuWxapkg:", file_path_wxapkg, err)
                fs.rmSync(file_path_wxapkg);
            });
        });

        myTask.on('error', err => {
            console.error('Error:', err);
        });
        // .then((res) => {
        //     console.log("uncompress done");
        //     // exec(`node wuWxapkg.js ${file_path_wxapkg}`, (err, std) => {
        //     //     console.log("wuWxapkg:", file_path_wxapkg, err)
        //     // });
        // })
        // .catch((err) => {
        //     console.log("uncompress err", err);
        // });

        count++
    });
}

exe(dir_root, dir_root);