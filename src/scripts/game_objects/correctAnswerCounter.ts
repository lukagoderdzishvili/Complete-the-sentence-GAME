import Configs from "../statics/configs";

export class CorrectAnswerCounter extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _text!: Phaser.GameObjects.Text;
    private _icon!: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene){
        super(scene, innerWidth - 30, 32);
        scene.add.existing(this);
        this._scene = scene;
      
        this._create();
    }

    private _create(): void{
        this._text = this._scene.add
            .text(0, 0, Configs.correctAnswerCounter.textIntialValue, Configs.correctAnswerCounter.textStyle)
            .setOrigin(0.5, 0.5)
            .setResolution(2);

        this._icon =  this._scene.add
            .image(-this._text.displayWidth - 10, 0, Configs.correctAnswerCounter.icon.texture)
            .setDisplaySize(Configs.correctAnswerCounter.icon.width, Configs.correctAnswerCounter.icon.height);
        
        
        this.add([this._text, this._icon])
    }


    public increase(): void{
        this._text.setText(`${+this._text.text + 1}`);
    }

    public get text(): string{
        return this._text.text;
    }

    public reset(): void{
        this._text.setText('0');
    }

    public onScreenChange(): void{
        const scale: number = innerWidth < 1001 ? 0.7 : innerWidth > 1920 ? innerWidth / 1920 : 1;
        this.setPosition(innerWidth - Configs.correctAnswerCounter.icon.width * scale, Configs.correctAnswerCounter.icon.height  * scale)
            .setScale(scale);
        
    }

}