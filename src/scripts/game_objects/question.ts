import { QuestionConfig } from "../statics/entities";
import { Answer } from "./answer";

export class Question extends Phaser.GameObjects.Container {
    private _scene: Phaser.Scene;
    private _config: QuestionConfig;
    private _answersContainer!: Phaser.GameObjects.Container;
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

                this.add([this._rect, this._textBeforeRect, this._textAfterRect]);
                
            }else{
                this._textWithouthRect = this._scene.add.text(0, index * this._strOffsetY, str, this._questionTextStyle).setResolution(2);
                this.add(this._textWithouthRect);
            }
        });

        let maxWidth = 0;
        (<Phaser.GameObjects.Text[]>this.list).forEach((text) => {
            if(text.displayWidth > maxWidth) maxWidth = text.displayWidth;
        });

        //SET TEXTS CENTER
        this._textBeforeRect.x -= this._strSizeWithRect / 2;
        this._textAfterRect.x -= this._strSizeWithRect / 2;
        this._rect.x -= this._strSizeWithRect / 2;
        if(strArray.length > 1)this._textWithouthRect.x -= maxWidth / 2;
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
        const answersContainerBackground = this._createContainerBackground(containerBackgroundSize);
        this._answersContainer.add(answersContainerBackground);
        this._answersContainer.sendToBack(answersContainerBackground);
    }

    private _containerBackgroundBounds = (): Phaser.GameObjects.Image => {
        return (<Phaser.GameObjects.Image>this._answersContainer.list[0]);
    }

    private _alignAnswers(target: Answer[], width: number, height: number, cellWidth: number, cellHeight: number, padding: number): void{
        const alignedAnswers = Phaser.Actions.GridAlign(target, {
            width,
            height,
            cellWidth: cellWidth + padding,
            cellHeight: cellHeight + padding,
            x: ((this._rectSize.width + padding) / 2) - ((target.length / 2) * (this._rectSize.width + padding)) ,
            y: 0
        });

        (<Answer[]>alignedAnswers).forEach(item => {
            item.setCorrectPosition(item.x, item.y);
        });

    }

    // Create the background image for the answers container
    private _createContainerBackground(size: { width: number, height: number }): Phaser.GameObjects.Image {
        return this._scene.add.image(0, 0, 'answersContainer')
            .setDisplaySize(size.width, size.height)
            .setAlpha(0);
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
       })
        
    }

    public onScreenChange(): void{
        let scale: number = innerWidth < 1001 ? Math.min((innerWidth / 1300), innerHeight / 800) : Math.min(innerWidth / 1920, innerHeight / 1080);
        this.setPosition(innerWidth / 2, innerHeight / 2)
        .setScale(scale);
        
    }
}
