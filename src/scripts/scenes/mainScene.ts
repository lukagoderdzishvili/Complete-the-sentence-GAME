import { AudioManager } from "../audioManager";
import { Question } from "../game_objects/question";
import { Paginator } from "../game_objects/paginator";
import * as Entities from '../statics/entities';
import { toggleFullScreen } from "../helpers";
import data from '../../../public/questions.json' assert { type: 'json' };

export default class MainScene extends Phaser.Scene{
    private _audioManager!: AudioManager;
    private _background!: Phaser.GameObjects.Image;
    private _paginator!: Paginator;
    private _submitButton!: Phaser.GameObjects.Image;

    private _gameData: Entities.GameData = data;
    private _questions: Question[] = [];
    private _checkMarkIcon!: Phaser.GameObjects.Image;
    private _correctAnswersCountText!: Phaser.GameObjects.Text;

    private _fullScreenButton!: Phaser.GameObjects.Image;

    constructor(){
        super({ key: 'MainScene' });
    }


    public create(): void{
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this._background = this.add.image(innerWidth / 2, innerHeight / 2, 'background').setDisplaySize(innerWidth, innerHeight);

        this._audioManager = new AudioManager(this);
        this._audioManager.backgroundMusic.play();
        
        this._paginator = new Paginator(this, this._changeQuestion, this._gameData.list.length);
     
        
        this._gameData.list.forEach((data) => {
            const question = new Question(this, data).setVisible(false);
            this._questions.push(question);
        });
        
        this._createSubmitButton();
        this._createCorrectAnswers();
        this._changeQuestion();
        this._createFullScreenButton();


        this.onScreenChange();
    }

    private _createSubmitButton(): void{
        this._submitButton = this.add
        .image(innerWidth / 2, innerHeight - 40, 'submitButton')
        .setDisplaySize(250, 60)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this._submitAnswer();
        });
    }

    public _createFullScreenButton(): void{
        this._fullScreenButton = this.add
        .image(innerWidth - 30, innerHeight - 30, 'fullscreen')
        .setDisplaySize(40, 40)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            toggleFullScreen();
        });
    }

    private async _submitAnswer(): Promise<void>{
        if(this._questions[this._paginator.currentPage - 1].isSubmitted) return;
        let isCorrect: boolean =  await this._questions[this._paginator.currentPage - 1].checkAndSubmit();
        if(isCorrect) this._increaseCorrectAnswerText();

        let unSubbmitedQuestionIndex: number = this._questions.findIndex((question, index) => !question.isSubmitted && index > this._paginator.currentPage - 1);
        if(unSubbmitedQuestionIndex === -1){
            unSubbmitedQuestionIndex = this._questions.findIndex((question) => !question.isSubmitted);
            if(unSubbmitedQuestionIndex !== -1){
                this._paginator.openPage(unSubbmitedQuestionIndex);
            }else{
                this._finishGame();
            }

        }else{
            this._paginator.openPage(unSubbmitedQuestionIndex);
        }
    }

    private _finishGame(): void{
        alert('GAME FINISHED: SCORE = ' + this._correctAnswersCountText.text)
    }

    private _increaseCorrectAnswerText(): void{
        this._correctAnswersCountText.setText(`${+this._correctAnswersCountText.text + 1}`);
    }

    private _createCorrectAnswers(): void{
        this._correctAnswersCountText = this.add.text(innerWidth - 20, 30, '0', {fontFamily: 'rubik', fontSize: 35, color: '#05fa32'});
        this._correctAnswersCountText.x -= this._correctAnswersCountText.displayWidth / 2;
        this._correctAnswersCountText.y -= this._correctAnswersCountText.displayHeight / 2;

        this._checkMarkIcon = this.add.image(this._correctAnswersCountText.x - 20, 30, 'checkmark').setDisplaySize(25, 28);
    }

    private _changeQuestion = (): void => {
        this._questions.forEach(question => {question.setVisible(false)});
        this._questions[this._paginator.currentPage - 1].setVisible(true);
        this._checkSubmitButton();
    }

    private _checkSubmitButton(): void{
        
        if(this._questions[this._paginator.currentPage - 1]?.isSubmitted){
            this._submitButton.removeInteractive().setAlpha(0.5);
        }else{
            this._submitButton.setInteractive({cursor: 'pointer'}).setAlpha(1);
        }
    }

    public onScreenChange(): void{
        let scale: number = innerWidth < 1001 ? (innerWidth / 1300) : (innerWidth / 1920);
        this._background
        .setPosition(innerWidth / 2, innerHeight / 2)
        .setDisplaySize(innerWidth, innerHeight);

        this._correctAnswersCountText.setPosition(innerWidth - 20, 30);
        this._correctAnswersCountText.x -= this._correctAnswersCountText.displayWidth / 2;
        this._correctAnswersCountText.y -= this._correctAnswersCountText.displayHeight / 2;

        this._checkMarkIcon.setPosition(this._correctAnswersCountText.x - 20, 30)


        this._fullScreenButton.setPosition(innerWidth - 30, innerHeight - 30);

        this._paginator.onScreenChange();
        this._submitButton.setPosition(innerWidth / 2, innerHeight - 40).setScale(Math.max(0.5, scale));

        this._questions.forEach(question => {
            question.onScreenChange();
        })
    }
}