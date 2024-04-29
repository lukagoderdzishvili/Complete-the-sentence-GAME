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
                
                this._rect = this._scene.add.image(this._textBeforeRect.displayWidth + (this._rectSize.width / 10) + (this._rectSize.width / 2), index * this._strOffsetY + this._rectSize.height / 2, 'answerBox').setDisplaySize(this._rectSize.width, this._rectSize.height);

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
        this._textWithouthRect.x -= maxWidth / 2;
    }

    private _drawAnswerContainer(): void{
        this._answersContainer = this._scene.add.container(0, -200);
        this.add(this._answersContainer);

        const containerBackgroundSize = {
            width: 800,
            height: 150
        };

        const answersContainerBackground = this._scene.add
        .image(0, 0, 'answersContainer')
        .setDisplaySize(containerBackgroundSize.width, containerBackgroundSize.height)
        .setAlpha(0.5);

        this._answersContainer.add(answersContainerBackground);


        const padding: number = 50;
        const zeroPointX: number = (-answersContainerBackground.width / 2) + this._rectSize.width / 2;
        const zeroPointY: number = padding - this._rect.height / 2;

        this._config.answers.forEach((answer, index) => {

            const item = new Answer(this._scene, {
                position: {
                    x: zeroPointX + (index * (this._rectSize.width + padding)) + padding * index,
                    y: zeroPointY
                },
                size: this._rectSize,
                text: answer
            });

            this._answersContainer.add(item);
        })
    }

    public onScreenChange(): void{
        let scale: number = innerWidth < 1001 ? (innerWidth / 1300) : (innerWidth / 1920);
        this.setPosition(innerWidth / 2, innerHeight / 2)
        .setScale(scale);
        
    }
}
