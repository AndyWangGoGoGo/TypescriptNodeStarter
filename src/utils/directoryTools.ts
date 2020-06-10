import fs from "fs";
import path from "path";

class DirectoryTools {

    private static _instance: DirectoryTools;
    public static get Instance(): DirectoryTools{
        if(!this._instance){
            this._instance = new DirectoryTools();
        }
        return this._instance;
    }

    /**
    * read path information
    * @param {string} path
    */
    private getStat = (path: string): Promise<fs.Stats> => {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if(err){
                    console.warn(`file stat err:${err}`);
                }
                resolve(stats);
            });
        });
    }

    /**
    * create path
    * @param {string} dir path
    */
    public mkdir = (dir: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            fs.exists(dir,(isExist)=>{
                if(isExist){
                    resolve(true);
                }
                else{
                    fs.mkdir(dir, err => {
                        if (err) {
                            console.warn(`mkdir err:${err}`);
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                }
            })
        });
    }

    /**
    * if the path exists and it is't a file,then return true
    * if the path does not exists, create it.
    * @param {string} dir path
    */
    public dirExists = async (dir: string): Promise<boolean> => {
        
        const isExists = await this.getStat(dir);
        // returns true if the path is not a file
        if (isExists && isExists.isDirectory()) {
            return true;
        } else if (isExists) {
            return false;
        }

        // get the superior path if the path does not exist .
        const tempDir = path.parse(dir).dir;
        //Recursively, if the parent directory does not exist, the code will continue to loop around until the directory exists
        const status = await this.dirExists(tempDir);
        let mkdirStatus;
        if (status) {
            mkdirStatus = await this.mkdir(dir);
        }
        return mkdirStatus;
    }
}

export default DirectoryTools.Instance