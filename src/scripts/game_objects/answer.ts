import * as Entities from '../statics/entities';

export class Answer extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _config: Entities.AnswerConfig;
    private _background!: Phaser.GameObjects.Image;
    private _text!: Phaser.GameObjects.Text;

    private _dragStartPosition!: Phaser.Math.Vector2;
    private _answerRect: Phaser.GameObjects.Image;
    


    constructor(scene: Phaser.Scene, config: Entities.AnswerConfig, answerRect: Phaser.GameObjects.Image){
        super(scene, config.position.x, config.position.y);
            
        this._scene = scene;
        this._config = config;
        this._answerRect = answerRect;

        this._draw();
        this._addEvent();// Add event listeners for drag interaction
    }

    /**
    * Draws the background image and text for the answer container.
    */
    private _draw(): void{
        // Create and configure the background image
        this._background = this._scene.physics.add
        .image(0, 0, 'goldSquare')
        .setDisplaySize(this._config.size.width, this._config.size.height);
        this.add(this._background);


        // Create and configure the text for the answer container
        this._text = this._scene.add.text(0, 0, this._config.value, {fontSize: 40, fontFamily: 'rubik', color: '#000000'});
        this._text.x -= this._text.displayWidth / 2;
        this._text.y -= this._text.displayHeight / 2;

        this.add(this._text);// Add the text to the container
    }


    private _addEvent(): void{
        this._background
        .on('pointerover', () => {
            this._scene.tweens.add({
                targets: this,
                scale: 1.05,
                duration: 100,
            });
        }).on('pointerout', () => {
            this._scene.tweens.add({
                targets: this,
                scale: 1,
                duration: 100,
            });
        });


        // Enable drag interaction for the background image
        this._background.setInteractive({ cursor: 'pointer', draggable: true });

        this._background.on('dragstart', (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) => {
            this._dragStartPosition = new Phaser.Math.Vector2(this.x, this.y);// Store the initial position of the drag
            this.parentContainer.bringToTop(this);// Bring the container to the top of the display hierarchy
        });

        this._background.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
             // Calculate the new position of the container based on drag movement and scale
            let scale: number = innerWidth < 1001 ? (innerWidth / 1300) : (innerWidth / 1920);
            const newX = this._dragStartPosition.x + dragX / scale;
            const newY = this._dragStartPosition.y + dragY / scale;
            this.setPosition(newX, newY);// Update the position of the container
        });


        this._background.on('dragend', () => {
            let isRectEmpty = this._answerRect.getData('answer') === undefined; // Check if the answer rectangle is empty

             // Check if the background intersects with the answer rectangle
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this._answerRect.getBounds())) {
                
                if(isRectEmpty){ // Snap the container to the answer rectangle if it's empty
                    this._answerRect.setData('answer', this);// Set the answer to the answer rectangle
                }else{
                    let answer = this._answerRect.getData('answer');// If the answer rectangle is not empty, tween the previous answer back to its initial position
                    this._answerRect.setData('answer', this);// Set the current answer to the answer rectangle

                    // Tween animation to return the previous answer to its initial position
                    this._scene.tweens.add({
                        targets: answer,
                        x: answer.initialPointPoisition.x,
                        y: answer.initialPointPoisition.y,
                        duration: 250,
                        ease: 'Power5'
                    });
                }
                
                // snap the container to the answer rectangle's position
                this._scene.tweens.add({
                    targets: this,
                    x: this._answerRect.x,
                    y: this._answerRect.y + Math.abs(this.parentContainer.y),
                    duration: 250
                });
            } else {
                // If the background does not intersect with the answer rectangle, return the container to its initial position
                this._scene.tweens.add({
                    targets: this,
                    x: this._config.position.x,
                    y: this._config.position.y,
                    duration: 250,
                    ease: 'Power5'
                });
            }
        });

    }

    public lockInteractions(): void{
        this._background.removeInteractive();
    }

    public get initialPointPoisition(): {x: number, y: number}{
        return this._config.position;
    }

    public get valueText(): string{
        return this._config.value;
    }
}