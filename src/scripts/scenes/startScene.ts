export default class StartScene extends Phaser.Scene{
    private _startButton!: Phaser.GameObjects.Image;

    constructor(){
        super({ key: 'StartScene' });
    }


    public create(): void{
        this._startButton = this.add.image(innerWidth / 2, innerHeight / 2, 'start')
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => { 
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MainScene');     
            });
        });


        
        this.onScreenChange();
    }


    public onScreenChange(): void{
        console.log('resize startscene');

        this._startButton
        .setScale(innerWidth / 1920)
        .setPosition(innerWidth / 2, innerHeight / 2);
    }
}