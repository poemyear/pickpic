export default class config {
    static configObj:Object = {
        //'serverAddress':'http://172.30.1.30:3000'
        'serverAddress':'http://localhost:3000'
    }; 
    static getConfig(key:string) {
        return config.configObj[key]; 
    }
}