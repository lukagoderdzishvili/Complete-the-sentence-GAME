export default class Configs{
    static gameConfig: Phaser.Types.Core.GameConfig = {
        title: 'Complete the sentence',
        version: "1.0.0",    
    
        type: Phaser.AUTO,
        transparent: false,
        backgroundColor: '#000000',
        disableContextMenu: true,
    
        scale: {
            parent: 'app',
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%',
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

    static scale: number = innerWidth < 1001 ? Math.min((innerWidth / 1300), innerHeight / 800) : Math.min(innerWidth / 1920, innerHeight / 1080);


    static onScreenChange(): void{
        Configs.scale = innerWidth < 1001 ? Math.min((innerWidth / 1300), innerHeight / 800) : Math.min(innerWidth / 1920, innerHeight / 1080);
    }
}