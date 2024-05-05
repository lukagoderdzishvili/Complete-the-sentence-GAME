import { AudioManager } from '../audioManager';
import Configs from '../statics/configs';
import * as Entities from '../statics/entities';

export class Answer extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _audioManager: AudioManager;
    private _config: Entities.AnswerConfig;
    private _background!: Phaser.GameObjects.Image;
    private _text!: Phaser.GameObjects.Text;

    private _dragStartPosition!: Phaser.Math.Vector2;
    private _answerRect: Phaser.GameObjects.Image;
    
    private _getParentLocalScale: () => number;
    private _changeAnswerBoxStateCallBack: (answer?: Answer) => void;

    constructor(
        scene: Phaser.Scene,
        audioManager: AudioManager,
        config: Entities.AnswerConfig, 
        answerRect: Phaser.GameObjects.Image, 
        getParentLocalScale: () => number,
        changeAnswerBoxStateCallBack: (answer?: Answer) => void
    ){
        super(scene, config.position.x, config.position.y);
            
        this._scene = scene;
        this._audioManager = audioManager;
        this._config = config;
        this._answerRect = answerRect;
        this._getParentLocalScale = getParentLocalScale;
        this._changeAnswerBoxStateCallBack = changeAnswerBoxStateCallBack;

        this._draw();
        this._addEvent();// Add event listeners for drag interaction
    }

    /**
    * Draws the background image and text for the answer container.
    */
    private _draw(): void{
        // Create and configure the background image
        this._background = this._scene.physics.add
        .image(0, 0, this._config.texture)
        .setDisplaySize(this._config.size.width, this._config.size.height);
        this.add(this._background);


        // Create and configure the text for the answer container
        this._text = this._scene.add.text(0, 0, this._config.value, {fontSize: 60, fontFamily: Configs.fontFamily, color: Configs.answersTextColor, align: 'center'}).setOrigin(0.5, 0.5);
        if(this._text.displayWidth > this._config.size.width) this._text.setFontSize(50 * (this._config.size.width / this._text.displayWidth));
        if(this._text.displayHeight > this._config.size.height)this._text.setFontSize(30 * (this._config.size.height / this._text.displayHeight));
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
            this._audioManager.pickup.play();
        });

        this._background.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            // Calculate the new position of the container based on drag movement and scale
            const newX = this._dragStartPosition.x + dragX / this._getParentLocalScale();
            const newY = this._dragStartPosition.y + dragY / this._getParentLocalScale();
            this.setPosition(newX, newY);// Update the position of the container
        });


        this._background.on('dragend', () => {
            let isRectEmpty = this._answerRect.getData('answer') === undefined || this._answerRect.getData('answer').valueText === this.valueText; // Check if the answer rectangle is empty
     
             // Check if the background intersects with the answer rectangle
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this._answerRect.getBounds())) {
                
                if(isRectEmpty){ // Snap the container to the answer rectangle if it's empty
                    this._answerRect.setData('answer', this);// Set the answer to the answer rectangle
                }else{
                    let answer = this._answerRect.getData('answer');// If the answer rectangle is not empty, tween the previous answer back to its initial position
                    this._answerRect.setData('answer', this);// Set the current answer to the answer rectangle
                    

                    // Tween animation to return the previous answer to its initial position
                    this._moveAnimation(answer, {x: answer.x, y: answer.y}, () => {return {x: answer.initialPointPoisition.x, y: answer.initialPointPoisition.y}});

                }
                

                this._changeAnswerBoxStateCallBack(this);
                // snap the container to the answer rectangle's position
                this._audioManager.drop.play();
                this._moveAnimation(this, {x: this.x, y: this.y}, () => {return {x: (this._answerRect.x - this.parentContainer.x + this._answerRect.parentContainer.x) / this.parentContainer.scale, y: (this._answerRect.y + Math.abs(this.parentContainer.y) + this._answerRect.parentContainer.y) / this.parentContainer.scale}});
                
            } else {
                if(this._answerRect.getData('answer')?.valueText === this._config.value)this._answerRect.setData('answer', undefined);
                this._changeAnswerBoxStateCallBack();
                // If the background does not intersect with the answer rectangle, return the container to its initial position
                this._moveAnimation(this, {x: this.x, y: this.y}, () => this._config.position);

            }
        });

    }

    private _moveAnimation(target: Answer, startPoint: {x: number, y: number}, endPoint: () => {x: number, y: number}): void{
        //ENDPOINT ARGUMENT MUST BE A FUNCTION TO UPDATE THE NEW STATE
        
        let extraY: number = (Math.abs(startPoint.y - endPoint().y) / 8) * (startPoint.y > endPoint().y ? -1 : 1);
        let extraX: number = (Math.abs(startPoint.x - endPoint().x) / 8) * (startPoint.x > endPoint().x ? -1 : 1);
        let duration: number = Math.max(250, Math.max(Math.abs(extraX), Math.abs(extraY)) * 5);

        this._scene.tweens.add({
            targets: target,
            x: () => endPoint().x + extraX,
            y: () => endPoint().y + extraY,
            duration,
            ease: 'Power5',

            onComplete: () => {
                this._scene.tweens.add({
                    targets: target,
                    x:  () => endPoint().x,
                    y: () => endPoint().y,
                    duration: duration / 2,
                    ease: 'Linear'
                });
            }
        });
    }
    

    public setAnswerRect(rect: Phaser.GameObjects.Image): void{
        this._answerRect = rect;
    }

    public setCorrectPosition(x: number, y: number): void{
        this._config.position = {x, y};
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