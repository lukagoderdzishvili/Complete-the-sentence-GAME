export class CorrectAnswerCounter extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _text!: Phaser.GameObjects.Text;
    private _icon!: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene){
        super(scene, innerWidth - 30, 20);
        scene.add.existing(this);
        this._scene = scene;
      
        this._create();
    }

    private _create(): void{
        this._text = this._scene.add.text(0, 0, '0', {fontFamily: 'rubik', fontSize: 35, color: '#05fa32'});
        this._text.x -= this._text.displayWidth / 2;
        this._text.y -= this._text.displayHeight / 2;

        this._icon =  this._scene.add.image(-30, 0, 'checkmark').setDisplaySize(25, 28);
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

    public onScreenChange(scale: number): void{
        this.setPosition(innerWidth - 30, 30).setScale(scale * ( innerWidth < 600 ? 2.5 : 1.5));
        
    }

}