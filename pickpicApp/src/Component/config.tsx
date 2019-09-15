export default class config {
    static configObj:Object = {
        //'serverAddress':'http://172.30.0.7:3000'
        'serverAddress':'http://localhost:3000'
    }; 
    static getConfig(key:string) {
        return config.configObj[key]; 
    }
}