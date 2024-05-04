export default class Configs{
    static gameConfig: Phaser.Types.Core.GameConfig = {
        title: 'Complete the sentence',
        version: "1.1.0",    
    
        type: Phaser.AUTO,
        transparent: false,
        backgroundColor: '#000000',
        disableContextMenu: true,
    
        scale: {
            parent: 'app',
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080,
            min: {
                width: 320,
                height: 200
            },
            max: {
                width: 3840,
                height: 2160,
            }
    
        },
    
        physics: {
            default: 'arcade'
        },
        dom: {
            createContainer: true
        },
    
        //,
        //fps: {
        //    target: 60,
        //    forceSetTimeOut: true,
        //    deltaHistory: 10,
        //    panicMax: 120,
        //    smoothStep: false
        //}         
    };

    static webScale: number = Math.min(innerWidth / 1920, innerHeight / 1080);
    static mobileScale: number = Math.min((innerWidth / 1200), innerHeight / 800) ;


    static onScreenChange(): void{
        Configs.mobileScale = Math.min((innerWidth / 1920), innerHeight / 1080) * 1.5;
        Configs.webScale =  Math.min(innerWidth / 1920, innerHeight / 1080);
    }
}