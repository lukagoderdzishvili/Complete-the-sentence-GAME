import { AudioManager } from "../audioManager";

export default class MainScene extends Phaser.Scene{
    private _audioManager!: AudioManager;
    private _background!: Phaser.GameObjects.Image;
    

    constructor(){
        super({ key: 'MainScene' });
    }


    public create(): void{
        this._audioManager = new AudioManager(this);

        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this._background = this.add
        .image(innerWidth / 2, innerHeight / 2, 'background').setDisplaySize(innerWidth, innerHeight);


        this.add.text(innerWidth / 2, innerHeight / 2, 'TEST', {fontFamily: 'rubik-bold', fontSize: '50px'});
    }


    public onScreenChange(): void{
        console.log('resize mainscene');
        this._background.setPosition(innerWidth / 2, innerHeight / 2).setDisplaySize(innerWidth, innerHeight);;
    }
}