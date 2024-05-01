import Configs from "../statics/configs";
import { QuestionConfig } from "../statics/entities";
import { Answer } from "./answer";

export class Question extends Phaser.GameObjects.Container {
    private _scene: Phaser.Scene;
    private _config: QuestionConfig;
    private _answersContainer!: Phaser.GameObjects.Container;
    private _questionContainer!: Phaser.GameObjects.Container;

    private _answersContainerBackground!: Phaser.GameObjects.Image;
    private _textWithouthRect!: Phaser.GameObjects.Text;
    private _textBeforeRect!: Phaser.GameObjects.Text;
    private _textAfterRect!: Phaser.GameObjects.Text;

    private _rect!: Phaser.GameObjects.Image; 

    private _rectSize: {width: number, height: number} = {width: 300, height: 100};
    private _strSizeWithRect: number = this._rectSize.width * 1.3;
    private _questionTextStyle: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'rubik', fontSize: 80, align: 'center' };
    private _strOffsetY: number = 150;

    public isSubmitted: boolean = false;

    constructor(scene: Phaser.Scene, config: QuestionConfig) {
        super(scene, innerWidth / 2, innerHeight / 2);
        scene.add.existing(this);
        this._scene = scene;
        this._config = config;

        this._drawQuestionTexts( config.value.split('\n') );
        this._drawAnswerContainer();
        
    }

    private _drawQuestionTexts(strArray: string[]): void{
        this._questionContainer = this._scene.add.container(0, 0);
        this.add(this._questionContainer);


        strArray.forEach((str, index) => {
            if(str.includes('###')){

                const placeholderIndex = str.indexOf('###');
                // Split the text into two parts: before and after the placeholder
                const textBefore = str.substring(0, placeholderIndex);
                const textAfter = str.substring(placeholderIndex + 3); 

                // Create text objects for each part
                this._textBeforeRect = this._scene.add
                .text(0, index * this._strOffsetY, textBefore, this._questionTextStyle)
                .setResolution(2);

                this._textAfterRect = this._scene.add
                .text(this._textBeforeRect.displayWidth + (this._rectSize.width / 10) * 2 + this._rectSize.width, index * this._strOffsetY, textAfter, this._questionTextStyle)
                .setResolution(2);
                
                this._rect = this._scene.physics.add.image(this._textBeforeRect.displayWidth + (this._rectSize.width / 10) + (this._rectSize.width / 2), index * this._strOffsetY + this._rectSize.height / 2, 'answerBox').setDisplaySize(this._rectSize.width, this._rectSize.height);

                this._strSizeWithRect += this._textAfterRect.displayWidth;
                this._strSizeWithRect += this._textBeforeRect.displayWidth;

                this._questionContainer.add([this._rect, this._textBeforeRect, this._textAfterRect]);
                
            }else{
                this._textWithouthRect = this._scene.add.text(0, index * this._strOffsetY, str, this._questionTextStyle).setResolution(2);
                this._textWithouthRect.x -= this._textWithouthRect.displayWidth / 2;
                this._questionContainer.add(this._textWithouthRect);
            }
        });

        //SET TEXTS CENTER
        this._textBeforeRect.x -= this._strSizeWithRect / 2;
        this._textAfterRect.x -= this._strSizeWithRect / 2;
        this._rect.x -= this._strSizeWithRect / 2;
    }

    private _drawAnswerContainer(): void{
        this._answersContainer = this._scene.add.container(0, -200);// Create the container for answers
        this.add(this._answersContainer);

        // Calculate initial positions for answers
        const itemsPadding: number = 50;
        
        // Create and add answer items to the container
        this._config.answers.forEach((answer) => {
            const item = new Answer(this._scene, {size: this._rectSize, position: {x: 0, y: 0}, value: answer }, this._rect, this._containerBackgroundBounds);
            this._answersContainer.add(item);
        });        
        this._alignAnswers(this._answersContainer.list as Answer[], this._answersContainer.list.length, 1, this._rectSize.width, this._rectSize.height, itemsPadding);
        
        // Set up the background image for the container
        const containerBackgroundSize = { width: (this._rectSize.width + itemsPadding) * this._answersContainer.list.length, height: 150 };
        this._answersContainerBackground = this._createContainerBackground(containerBackgroundSize);
        this._answersContainer.add(this._answersContainerBackground);
        this._answersContainer.sendToBack(this._answersContainerBackground);
    }

    private _containerBackgroundBounds = (): Phaser.GameObjects.Image => {
        return this._answersContainerBackground;
    }

    private _alignAnswers(target: Answer[], row: number, column: number, cellWidth: number, cellHeight: number, padding: number): void{
        const alignedAnswers = Phaser.Actions.GridAlign(target, {
            width: row,
            height: column,
            cellWidth: cellWidth + padding,
            cellHeight: cellHeight + padding,
            x: ((this._rectSize.width + padding) / 2) - ((Math.max(row, 1) / 2) * (this._rectSize.width + padding)) ,
            y: ((this._rectSize.height + padding) / 2) - ((Math.max(column, 1) / 2) * (this._rectSize.height + padding))
        });

        (<Answer[]>alignedAnswers).forEach(item => {
            item.setCorrectPosition(item.x, item.y);
        });

    }

    // Create the background image for the answers container
    private _createContainerBackground(size: { width: number, height: number }): Phaser.GameObjects.Image {
        return this._scene.add.image(0, 0, 'answersContainer')
            .setDisplaySize(size.width, size.height)
            .setAlpha(1);
    }

    private _lock(): void{
        this._answersContainer.list.forEach(item => {
            if(item instanceof Answer)item.lockInteractions();
        });
        this.isSubmitted = true;
    }

    public checkAndSubmit(): Promise<boolean>{
       return new Promise((resolve, _reject) => {
        const answer: Answer | undefined = this._rect.getData('answer');
        this._lock();
        if(answer == undefined) {
            
            return resolve(false);
        };
        
        const isCorrect: boolean = answer.valueText === this._config.correctAnswer;
        let statusImage: Phaser.GameObjects.Image = this._scene.add
        .image(this._rect.x + this._rectSize.width / 2 - 30, this._rect.y, isCorrect ? 'correct' : 'incorrect')
        .setDisplaySize(60, 60);

        this._rect.parentContainer.add(statusImage);
        this._scene.tweens.add({
            targets: statusImage,
            displayWidth: 30,
            displayHeight: 30,
            yoyo: true,
            duration: 500,
            onComplete: () => {
                this._scene.tweens.add({
                    targets: statusImage,
                    displayWidth: 30,
                    displayHeight: 30,
                    duration: 500,
                    completeDelay: 1000,
                    onComplete: () => {
                        return resolve(isCorrect);
                    }
                });
            }
        });
       });
        
    }

    private _switchLayout(long: boolean): void {
        if (long) {
            const padding: number = 50;
            // Align answers without the first item
            const answersClone = [...this._answersContainer.list];
            answersClone.shift(); // Remove the first item
            this._alignAnswers(answersClone as Answer[], answersClone.length, 1, this._rectSize.width, this._rectSize.height, padding);
    
            // Calculate total height for the background
            const backgroundSize = { width: (this._rectSize.width + padding) * answersClone.length, height: 150 };
    
            // Set the position and size of the background
            this._answersContainerBackground
                .setDisplaySize(backgroundSize.width, backgroundSize.height)
                .setPosition(0, 0);

            this._answersContainer.setPosition(0, -200);
            this._questionContainer.setPosition(0, 0);
        }else{
            const padding: number = 50;
            // Align answers without the first item
            const answersClone = [...this._answersContainer.list];
            answersClone.shift(); // Remove the first item
            this._alignAnswers(answersClone as Answer[], 1, answersClone.length, this._rectSize.width, this._rectSize.height, padding);
    
            // Calculate total height for the background
            const backgroundHeight = (this._rectSize.height + padding) * answersClone.length;
    
            // Set the position and size of the background
            this._answersContainerBackground
                .setDisplaySize(this._rectSize.width + padding * 2, backgroundHeight)
                .setPosition((<Answer>this._answersContainer.list[2]).x, 0);

            this._answersContainer.setPosition((-innerWidth / 1.8) / Configs.scale + this._answersContainerBackground.displayWidth, 0);
            this._questionContainer.setPosition(300, -this._answersContainer.y / 2 - this._rectSize.height);
        }
    }

    public onScreenChange(): void{
       this._switchLayout(true);
       this.setPosition(innerWidth / 2, innerHeight / 2).setScale(Configs.scale);
    }
}
