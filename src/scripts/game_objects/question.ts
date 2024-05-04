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
    private _statusIcon!: Phaser.GameObjects.Image;
    
    private _initialSize: {width: number, height: number} = {width: 450, height: 210};
    private _rectSize: {width: number, height: number} = {width: 450, height: 210};
    private _answerItemsPadding: number = 50;
    private _strSizeWithRect: number = this._rectSize.width * 1.3;
    private _questionTextStyle: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'opensans-semibold', fontSize: 95, align: 'center' };
    private _strOffsetY: number = this._initialSize.height ;
    private _questionTextLinesCount: number = 3; 

    private _localScale: number = Configs.webScale;
    private _row!: number;
    private _column!: number;
    
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
        this._switchLayout(this._config.layout);

        // setInterval(() => {
        //     this._config.layout = this._config.layout === 'mini' ? 'long' : 'mini';
        //     this._switchLayout(this._config.layout);
        //     this.onScreenChange();
        // }, 3000)
    }

    private _createWordsMap(words: string[]): {word: string, count: number}[]{
        const wordsArr: {word: string, count: number}[] = [];
        
        words.forEach(word => {
            if(word == '###'){
                wordsArr.push({word: '###', count: this._rectSize.width });
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

        this._questionTextLinesCount = lines.length;
        return lines;

    }

    private _drawQuestionTexts(str: string): void{
        this._questionContainer = this._scene.add.container(0, 0);
        this.add(this._questionContainer);
        this.sendToBack(this._questionContainer);

        const words = str.split(" ");

        const wordPairs = this._createWordsMap(words);
        let strArray: string[] = this._createLines(wordPairs, this._config.layout === 'long' ? innerWidth * 0.7 : innerWidth / 2.5);
      
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
                .add.image(textBeforeRect.displayWidth + (this._rectSize.width / 10) + (this._rectSize.width / 2), textBeforeRect.getBounds().centerY, 'targetArea')
                .setDisplaySize(this._rectSize.width, this._rectSize.height)
                .setData('answer', this._data.answerBoxContent);
                
                this._strSizeWithRect += textAfterRect.displayWidth;
                this._strSizeWithRect += textBeforeRect.displayWidth;


                //SET TEXTS CENTER
                textBeforeRect.x -= this._strSizeWithRect / 2;
                textAfterRect.x -= this._strSizeWithRect / 2;
                this._rect.x -= this._strSizeWithRect / 2;
                
                this._questionContainer.add([this._rect, textBeforeRect, textAfterRect]);
                    
            }else{
                const textWithouthRect = this._scene.add.text(0, index * this._strOffsetY, str, this._questionTextStyle).setResolution(2);
                textWithouthRect.x -= textWithouthRect.displayWidth / 2;
                this._questionContainer.add(textWithouthRect);
            }
        });

        this._answersContainer?.list.forEach(item => {
            if(item instanceof Answer) item.setAnswerRect(this._rect);
        });

        this._questionContainer.setPosition(this._config.layout === 'long' ? 0 : innerWidth / 6, this._config.layout === 'long' ? 0 : -this._questionTextLinesCount * (this._rectSize.height / 2))

        if(this._data.answerBoxContent){
            this._data.answerBoxContent.setPosition(
                (this._rect.x - this._answersContainer.x + this._questionContainer.x) / this._answersContainer.scale,
                (this._rect.y + Math.abs(this._answersContainer.y) + this._questionContainer.y) / this._answersContainer.scale
            );
            
            this._rect.setData('answer', this._data.answerBoxContent);
            if(this._data.isSubmitted)this.checkAndSubmit(true);
        }


    }

    private _drawAnswerContainer(): void{
        this._answersContainer = this._scene.add.container(0, -200);// Create the container for answers
        this.add(this._answersContainer);
        

        const textures: string[] = ['letterBox1', 'letterBox2', 'letterBox3'];
        // Create and add answer items to the container
        this._config.answers.forEach((answer, index) => {
            const item = new Answer(this._scene, {size: this._rectSize, position: {x: 0, y: 0}, value: answer , texture: textures[index % 2]}, this._rect, this._getLocalScale, this._changeAnswerBoxStateCallBack);
            this._answersContainer.add(item);
        });        
        this._alignAnswers(this._answersContainer.list as Answer[], this._answersContainer.list.length, 1, this._rectSize.width, this._rectSize.height, this._answerItemsPadding);
        
        // Set up the background image for the container
        const containerBackgroundSize = { width: (this._rectSize.width + this._answerItemsPadding) * this._answersContainer.list.length, height: this._initialSize.height + this._answerItemsPadding };
        this._answersContainerBackground = this._createContainerBackground(containerBackgroundSize);
        this._answersContainer.add(this._answersContainerBackground);
        this._answersContainer.sendToBack(this._answersContainerBackground);
    }

    private _alignAnswers(target: Answer[], row: number, column: number, cellWidth: number, cellHeight: number, padding: number): void{
        this._row = row;
        this._column = column;

        const alignedAnswers = Phaser.Actions.GridAlign(target, {
            width: row,
            height: column,
            cellWidth: cellWidth + padding,
            cellHeight: cellHeight + padding,
            x: ((cellWidth + padding) / 2) - ((Math.max(row, 1) / 2) * (cellWidth + padding)) ,
            y: ((cellHeight + padding) / 2) - ((Math.max(column, 1) / 2) * (cellHeight+ padding))
        });

        (<Answer[]>alignedAnswers).forEach(item => {
            item.setCorrectPosition(item.x, item.y);
        });

    }

    // Create the background image for the answers container
    private _createContainerBackground(size: { width: number, height: number }): Phaser.GameObjects.Image {
        return this._scene.add.image(0, 0, 'targetArea')
            .setDisplaySize(size.width, size.height)
            //.setAlpha(0.5);
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
        if(answer == undefined) return resolve(false);


        const size = (30) * this._localScale;
        const isCorrect: boolean = answer.valueText === this._config.correctAnswer;
        this._statusIcon = this._scene.add
        .image(this._rect.x + this._rectSize.width / 2 - size, this._rect.y, isCorrect ? 'correct' : 'incorrect')
        .setDisplaySize(size, size);

        this.bringToTop(this._rect.parentContainer);
        this._rect.setVisible(false);
        this._rect.parentContainer.add(this._statusIcon);
        if(force)return resolve(true);
        

            this._scene.tweens.add({
                targets: this._statusIcon,
                displayWidth: size * 3,
                displayHeight: size * 3,
                duration: 500,
                yoyo: true,
                ease: Phaser.Math.Easing.Quadratic.In,
                completeDelay: 250,
                onComplete: () => {
                    return resolve(isCorrect);
                }
            });
       });
        
    }

    private _switchLayout(layout: string): void {
        if (layout === 'mini') {
            // Align answers without the first item
            const answersClone = [...this._answersContainer.list];
            answersClone.shift(); // Remove the first item
            this._alignAnswers(answersClone as Answer[], 1, answersClone.length, this._initialSize.width, this._initialSize.height, this._answerItemsPadding);

            // Set the position and size of the background
            this._answersContainerBackground
                .setDisplaySize((this._initialSize.width + this._answerItemsPadding) * this._row , (this._initialSize.height + this._answerItemsPadding) * this._column)
                .setPosition((<Answer>this._answersContainer.list[2]).x, 0);

        }else{
            // Align answers without the first item
            const answersClone = [...this._answersContainer.list];
            answersClone.shift(); // Remove the first item
            this._alignAnswers(answersClone as Answer[], answersClone.length, 1, this._initialSize.width, this._initialSize.height, this._answerItemsPadding);
    
            // Set the position and size of the background
            this._answersContainerBackground
                .setDisplaySize((this._initialSize.width + this._answerItemsPadding) * this._row , (this._initialSize.height + this._answerItemsPadding) * this._column)
                .setPosition(0, 0);
        }
    }

    private _resetQuestionObjects(): void{
        this._questionContainer.list.forEach(item => {
            if(item instanceof Phaser.GameObjects.Text)item.destroy();
        });
        this._questionContainer.destroy();
        this._rect.destroy();
        this._strSizeWithRect = this._rectSize.width * 1.3;
    }

    private _changeAnswersLayout(layout: {row: number, column: number, width: number, height: number, padding: number}): void{
        let answersClone = [...this._answersContainer.list];
        answersClone.shift();
    
    
        this._alignAnswers(answersClone as Answer[], layout.row, layout.column, layout.width, layout.height, layout.padding);
        this._answersContainerBackground.setDisplaySize( (layout.width + layout.padding) * layout.row, (layout.height + layout.padding) * layout.column)

        this._row = 2;
        this._column = 2;

        // Reposition question container
        this._questionContainer.setPosition(this._config.layout === 'long' ? 0 : innerWidth / 6, this._config.layout === 'long' ? 0 : this._answersContainerBackground.getBounds().bottom - innerHeight / 2 + this._rectSize.height / 2)
        
        // Reposition answer box if submitted
        if(this._data.answerBoxContent){
            this._data.answerBoxContent.setPosition((this._rect.x - this._answersContainer.x + this._questionContainer.x) / this._answersContainer.scale, (this._rect.y + Math.abs(this._answersContainer.y) + this._questionContainer.y) / this._answersContainer.scale);
            this._rect.setData('answer', this._data.answerBoxContent);
            if(this._data.isSubmitted)this.checkAndSubmit(true);
            
        }
        this.onScreenChange();
    }

    private _getLocalScale = (): number => {
        return this._answersContainer.scale;
    }

    private _calculateAnswerContainerScaling(): number{
        let answersScaleY: number = this._config.layout === 'mini' 
        ? (innerHeight * 0.6) / (((this._initialSize.height + this._answerItemsPadding) * this._column) * this._localScale)
        : (innerHeight / 3)  /  (((this._initialSize.height + this._answerItemsPadding) * this._column) * this._localScale );

        let answersScaleX: number = this._config.layout === 'mini' 
        ? (innerWidth * 0.4) / (((this._initialSize.width + this._answerItemsPadding) * this._row) * this._localScale )
        : (innerWidth * 0.9) / (((this._initialSize.width + this._answerItemsPadding) * this._row) * this._localScale );

        // if(answersScaleX > 1) answersScaleX = 1;
        // if(answersScaleY > 1) answersScaleY = 1;
        return Math.min(1, Math.min(answersScaleX, answersScaleY));
    }

    public get isSubmitted(): boolean{
        return this._data.isSubmitted;
    }

    public onScreenChange(): void{
        this._localScale = innerWidth < 501  && this._config.layout === 'long' ? Configs.mobileScale : Configs.webScale ;
        const answerContainerScale: number = this._localScale * this._calculateAnswerContainerScaling();

        this._strOffsetY = this._initialSize.height * this._localScale;

        // Update font size
        this._questionTextStyle.fontSize = 95 * this._localScale;
        if(innerHeight < 500 && innerWidth < 1001) this._questionTextStyle.fontSize = 70 * this._localScale;

        // Update container size and position
        this._rectSize = {
            width: 450 * answerContainerScale,
            height: 210 * answerContainerScale
        };

       this.setPosition(innerWidth / 2, innerHeight / 2 );

        if(this.visible){
            this._answersContainer.setScale(answerContainerScale);
            // Reposition answer container
            const answerContainerX = this._config.layout === 'long' ? 0 : -innerWidth / 1.7 + this._answersContainerBackground.displayWidth * this._localScale;
            const answerContainerY = this._config.layout === 'long' ? -innerHeight / 5 : 0;
            this._answersContainer.setPosition(answerContainerX, answerContainerY);



            // Reset question objects
            this._resetQuestionObjects();


            // Adjust question container position
            this._questionContainer.y = this._config.layout === 'mini'
            ? -this._questionContainer.getBounds().height / 2
            : this._answersContainerBackground.getBounds().bottom - innerHeight / 2 + this._rectSize.height / 2;
            
            this._drawQuestionTexts(this._config.value);

            // Check if the layout is suitable for a 2x2 answer layout
            if(this._config.answers.length === 4 ){
                // Check if the answer container width exceeds the screen width
                if( this._answersContainerBackground.displayWidth * this._localScale >= innerWidth){
                    const layout2 = {row: 2, column: 2, width: this._initialSize.width, height: this._initialSize.height, padding: this._answerItemsPadding};
                    this._changeAnswersLayout(layout2);
                }

                
            }
        }

    }
}
