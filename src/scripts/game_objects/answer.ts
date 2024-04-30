import * as Entities from '../statics/entities';

export class Answer extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _config: Entities.AnswerConfig;
    private _background!: Phaser.GameObjects.Image;
    private _text!: Phaser.GameObjects.Text;

    private _dragStartPosition!: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, config: Entities.AnswerConfig){
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

        this._text = this._scene.add.text(0, 0, this._config.value, {fontSize: 40, fontFamily: 'rubik', color: '#000000'});
        this._text.x -= this._text.displayWidth / 2;
        this._text.y -= this._text.displayHeight / 2;

        this.add(this._text);
    }


    private _addEvent(): void{

        this._background.setInteractive({ cursor: 'pointer', draggable: true });

        this._background.on('dragstart', (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) => {
            this._dragStartPosition = new Phaser.Math.Vector2(this.x, this.y);
        });

        this._background.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            let scale: number = innerWidth < 1001 ? (innerWidth / 1300) : (innerWidth / 1920);
            // Adjust the dragging based on the scale of the container
            const newX = this._dragStartPosition.x + dragX / scale;
            const newY = this._dragStartPosition.y + dragY / scale;
            this.setPosition(newX, newY);
        });
    }

    
}