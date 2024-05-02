import Configs from "../statics/configs";
import { QuestionConfig } from "../statics/entities";
import { Answer } from "./answer";

export class Question extends Phaser.GameObjects.Container {
    private _scene: Phaser.Scene;
    private _config: QuestionConfig;
    private _answersContainer!: Phaser.GameObjects.Container;
    private _questionContainer!: Phaser.GameObjects.Container;

    private _answersContainerBackground!: Phaser.GameObjects.Image;

    private _rect!: Phaser.GameObjects.Image; 

    private _rectSize: {width: number, height: number} = {width: 300, height: 100};
    private _strSizeWithRect: number = this._rectSize.width * 1.3;
    private _questionTextStyle: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'rubik', fontSize: 80, align: 'center' };
    private _strOffsetY: number = 100;
    
    private _data: {
        answerBoxContent: Answer | undefined,
        isSubmitted: boolean
    } = {
        answerBoxContent: undefined,
        isSubmitted: false
    }
    

    constructor(scene: Phaser.Scene, config: QuestionConfig) {
        super(scene, innerWidth / 2, innerHeight / 2);
        scene.add.existing(this);
        this._scene = scene;
        this._config = config;
        this._drawQuestionTexts( config.value );
        this._drawAnswerContainer();
        
        
    }

    private _createWordsMap(words: string[]): {word: string, count: number}[]{
        const wordsArr: {word: string, count: number}[] = [];
        
        words.forEach(word => {
            if(word == '###'){
                wordsArr.push({word: '###', count: 300 });
            }else{
                const charText: Phaser.GameObjects.Text = this._scene.add.text(0, 0, word, this._questionTextStyle).setAlpha(0);
                const length: number = charText.displayWidth;
                wordsArr.push({word, count:length});
                charText.destroy();
            }
        });

        return wordsArr;
    }

    private _createLines(wordsArr: {word: string, count: number}[], maxWidth: number): string[]{
        const lines: string[] = [];

        
        let count: number = 0, str: string = '';
        wordsArr.forEach((pair) => {
            if(count + pair.count > maxWidth){
                lines.push(str);
                str = pair.word;
                count = pair.count;
            }else{
                count += pair.count;
                str+= " ";
                str+= pair.word;
            }
        });
        lines.push(str);   

        return lines;

    }

    private _drawQuestionTexts(str: string): void{
        this._questionContainer = this._scene.add.container(0, 0);
        this.add(this._questionContainer);
        this.sendToBack(this._questionContainer);

        const words = str.split(" ");

        const wordPairs = this._createWordsMap(words);
        let strArray: string[] = this._createLines(wordPairs, innerWidth * 0.8);
      
        strArray.forEach((str, index) => {
            if(str.includes('###')){

                const placeholderIndex = str.indexOf('###');
                // Split the text into two parts: before and after the placeholder
                const textBefore = str.substring(0, placeholderIndex);
                const textAfter = str.substring(placeholderIndex + 3); 

                // Create text objects for each part
                const textBeforeRect = this._scene.add
                .text(0, index * this._strOffsetY, textBefore, this._questionTextStyle)
                .setResolution(2);

                const textAfterRect = this._scene.add
                .text(textBeforeRect.displayWidth + (this._rectSize.width / 10) * 2 + this._rectSize.width, index * this._strOffsetY, textAfter, this._questionTextStyle)
                .setResolution(2);
                
                this._rect = this._scene.physics
                .add.image(textBeforeRect.displayWidth + (this._rectSize.width / 10) + (this._rectSize.width / 2), index * this._strOffsetY + this._rectSize.height / 2, 'answerBox')
                .setDisplaySize(this._rectSize.width, this._rectSize.height)
                .setData('answer', this._data.answerBoxContent);
                
                
                this._strSizeWithRect += textAfterRect.displayWidth;
                this._strSizeWithRect += textBeforeRect.displayWidth;


                //SET TEXTS CENTER
                textBeforeRect.x -= this._strSizeWithRect / 2;
                textAfterRect.x -= this._strSizeWithRect / 2;
                this._rect.x -= this._strSizeWithRect / 2;
                
                this._questionContainer.add([this._rect, textBeforeRect, textAfterRect]);
                
                if(this._data.answerBoxContent){
                    this._data.answerBoxContent.setPosition(this._rect.x - this._answersContainer.x + this._questionContainer.x, this._rect.y + Math.abs(this._answersContainer.y) + this._questionContainer.y);
                    this._rect.setData('answer', this._data.answerBoxContent);
                    this.checkAndSubmit(true);
                    
                }
                    
            }else{
                const textWithouthRect = this._scene.add.text(0, index * this._strOffsetY, str, this._questionTextStyle).setResolution(2);
                textWithouthRect.x -= textWithouthRect.displayWidth / 2;
                this._questionContainer.add(textWithouthRect);
            }
        });

        // const questionContainerWidth: number = Math.max(this._strSizeWithRect ?? 0, textWithouthRect?.displayWidth ?? 0); 
        // this._questionContainer.width = questionContainerWidth;
        // this._questionContainer.displayWidth = questionContainerWidth;
    }

    private _drawAnswerContainer(): void{
        this._answersContainer = this._scene.add.container(0, -200);// Create the container for answers
        this.add(this._answersContainer);

        // Calculate initial positions for answers
        const itemsPadding: number = 50;
        
        // Create and add answer items to the container
        this._config.answers.forEach((answer) => {
            const item = new Answer(this._scene, {size: this._rectSize, position: {x: 0, y: 0}, value: answer }, this._rect, this._containerBackgroundBounds, this._changeAnswerBoxStateCallBack);
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
        this._data.isSubmitted = true;
    }


    private _changeAnswerBoxStateCallBack = (answer?: Answer): void => {
        this._data.answerBoxContent = answer;
    }

    public checkAndSubmit(force?: boolean): Promise<boolean>{
       return new Promise((resolve, _reject) => {
        const answer: Answer | undefined = this._rect.getData('answer') ?? this._data.answerBoxContent;
        this._lock();
        if(answer == undefined) {
            
            return resolve(false);
        };
        
        const isCorrect: boolean = answer.valueText === this._config.correctAnswer;
        let statusImage: Phaser.GameObjects.Image = this._scene.add
        .image(this._rect.x + this._rectSize.width / 2 - 30, this._rect.y, isCorrect ? 'correct' : 'incorrect')
        .setDisplaySize(force ? 30 : 60, force ? 30 : 60);

        this.bringToTop(this._rect.parentContainer);
        this._rect.setVisible(false);
        this._rect.parentContainer.add(statusImage);
        if(force)return resolve(true);
        

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

            this._answersContainer.setPosition((-innerWidth / 2) + this._answersContainerBackground.displayWidth, 0);
            this._questionContainer.setPosition(300, -this._answersContainer.y / 2 - this._rectSize.height);
        }
    }

    private _resetQuestionObjects(): void{
        this._questionContainer.list.forEach(item => {
            console.log(item);
            if(item instanceof Phaser.GameObjects.Text)item.destroy();
        });
        this._questionContainer.destroy();
        this._rect.destroy();
        this._strSizeWithRect = this._rectSize.width * 1.3;
    }

    public get isSubmitted(): boolean{
        return this._data.isSubmitted;
    }

    public onScreenChange(): void{
       this.setPosition(innerWidth / 2, innerHeight / 2)//.setScale(Configs.scale);


        if(this.visible){
            this._resetQuestionObjects();
            this._drawQuestionTexts(this._config.value);
            this._answersContainer.list.forEach(item => {
                if(item instanceof Answer) item.setAnswerRect(this._rect);
            });
        }

    }
}
