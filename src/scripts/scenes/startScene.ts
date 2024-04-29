export default class StartScene extends Phaser.Scene{
    private _startButtonContainer!: Phaser.GameObjects.Container;
    private _startButton!: Phaser.GameObjects.Image;

    constructor(){
        super({ key: 'StartScene' });
    }


    public create(): void{

        this._drawStartButton();
       
    }

    private _drawStartButton(): void{
        this._startButtonContainer = this.add
        .container(innerWidth / 2, innerHeight / 2)
        .setScale(innerWidth / 1920);

        this._startButton = this.add
        .image(0, 0, 'start')
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this._startButton.removeInteractive();
            this._startButtonCallBack();
        });

        this._startButtonContainer.add(this._startButton);

        //SCALE ANIMATION
        this._createStartButtonAnimation();
    }

    private _createStartButtonAnimation(): void{
        this.tweens.add({
            targets: this._startButton,
            duration: 500,
            scale: '+=0.1',
            yoyo: true,
            repeat: -1
        });
    }

    private _startButtonCallBack(): void{
        //SCENE SWITCH ANIMATION 
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('MainScene');     
        });

    }

    public onScreenChange(): void{
        this._startButtonContainer
        .setScale(innerWidth / 1920)
        .setPosition(innerWidth / 2, innerHeight / 2);
    }
}