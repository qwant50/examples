class Autoloader {
    constructor(version = '') {
        this.version = version;
        this.map = new Map();
    }

    static getHash(str) {
        let hash = 0;
        for (let ch of str) {
            hash = ((hash << 5) - hash) + ch.charCodeAt(0);
            hash |= 0; // to 32bit integer
        }
        return hash;
    }

    loadItem(url) {
        return new Promise(resolve => {
            url = url + this.version;
            let hash = Autoloader.getHash(url);
            if (this.map.has(hash)) {
                resolve();
            } else {
                let script = document.createElement("script");
                script.type = "text/javascript";

                if (script.readyState) {  //IE
                    script.onreadystatechange = () => {
                        if (["loaded", "complete"].includes(script.readyState)) {
                            script.onreadystatechange = null;
                            this.map.set(hash, url);
                            resolve();
                        }
                    };
                } else {  //Others
                    script.onload = () => {
                        this.map.set(hash, url);
                        resolve();
                    };
                }

                script.src = url;
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        });
    }

    // loadBundle(arrayOfUrl: ['\js\someFile1.js', ''\js\someFile2.js''])
    loadBundle(arrayOfUrl) {
        let arrayOfPromises = [];
        arrayOfUrl.forEach(url => arrayOfPromises.push(this.loadItem(url)));
        return Promise.all(arrayOfPromises);
    }
}
