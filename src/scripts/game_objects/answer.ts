export class Answer extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _config: any;
    private _background!: Phaser.GameObjects.Image;
    private _text!: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, config: any){
        super(scene, config.position.x, config.position.y);
            
        this._scene = scene;
        this._config = config;

        this._draw();
        this._addEvent();
    }

    private _draw(): void{
        this._background = this._scene.add
        .image(0, 0, 'goldSquare')
        .setDisplaySize(this._config.size.width, this._config.size.height);
        this.add(this._background);

        this._text = this._scene.add.text(0, 0, this._config.text, {fontSize: 40, fontFamily: 'rubik', color: '#000000'});
        this._text.x -= this._text.displayWidth / 2;
        this._text.y -= this._text.displayHeight / 2;

        this.add(this._text);
    }


    private _addEvent(): void{
        this._background.setInteractive({cursor: 'pointer'});
        this._background.on('pointerdown', () => {
            alert(this._config.text);
        });
    }

    
}