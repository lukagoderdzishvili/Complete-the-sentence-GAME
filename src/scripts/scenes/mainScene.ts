import { AudioManager } from "../audioManager";
import { Question } from "../game_objects/question";
import { Paginator } from "../game_objects/paginator";
import * as Entities from '../statics/entities';
import { toggleFullScreen } from "../helpers";
import { Timer } from "../game_objects/timer";
import { FinishDialog } from "../partials/finishDialog";
import { CorrectAnswerCounter } from "../game_objects/correctAnswerCounter";
import Configs from "../statics/configs";

export default class MainScene extends Phaser.Scene{
    private _audioManager!: AudioManager;
    private _timer!: Timer;
    private _finishDialog!: FinishDialog;
    private _correctAnswerCounter!: CorrectAnswerCounter;
    private _background!: Phaser.GameObjects.Image;
    private _paginator!: Paginator;
    private _submitButton!: Phaser.GameObjects.Image;

    private _gameData: Entities.GameData;
    private _questions: Question[] = [];

    private _fullScreenButton!: Phaser.GameObjects.Image;
    private _playAgainButton!: Phaser.GameObjects.Image;

    constructor(gameData: Entities.GameData){
        super({ key: 'MainScene' });
        this._gameData = gameData;
    }   


    public create(): void{
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this._background = this.add.image(innerWidth / 2, innerHeight / 2, 'background').setDisplaySize(innerWidth, innerHeight);


        this._audioManager = new AudioManager(this);
        this._timer = new Timer(this);
        this._audioManager.backgroundMusic.play();
        
        this._paginator = new Paginator(this, this._changeQuestion, this._gameData.list.length);
        this._correctAnswerCounter = new CorrectAnswerCounter(this);
        
        
        this._createQuestions();
        this._createSubmitButton();
       
        this._changeQuestion();
        this._createFullScreenButton();
        this._createPlayAgainButton();

        this.onScreenChange();
    }

    private _createQuestions(): void{
        this._gameData.list.forEach((data) => {
            const question = new Question(this, data).setVisible(false);
            this._questions.push(question);
        });
    }

    private _createSubmitButton(): void{
        this._submitButton = this.add
        .image(innerWidth / 2, innerHeight - 40, Configs.submitButton.texture)
        .setDisplaySize(Configs.submitButton.width, Configs.submitButton.height)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this._submitButton.setAlpha(0.5);
            this._submitAnswer();
        });
    }

    public _createFullScreenButton(): void{
        this._fullScreenButton = this.add
        .image(innerWidth - 10, innerHeight - 10, Configs.fullScreenButton.texture.defualt)
        .setDisplaySize(Configs.fullScreenButton.width, Configs.fullScreenButton.height)
        .setOrigin(Configs.fullScreenButton.origin.x, Configs.fullScreenButton.origin.y)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            toggleFullScreen();
        });
    }

    private _createPlayAgainButton(): void{
        this._playAgainButton = this.add
        .image(10, innerHeight - 10, Configs.playAgainButton.texture)
        .setDisplaySize(Configs.playAgainButton.width, Configs.playAgainButton.height)
        .setOrigin(Configs.playAgainButton.origin.x, Configs.playAgainButton.origin.y)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this._resetGame(); 
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
        this._timer.pause();
        this._finishDialog = new FinishDialog(this, this._correctAnswerCounter.text, this._questions.length, this._timer.value, false, this._resetGame);
    }

    private _increaseCorrectAnswerText(): void{
        this._correctAnswerCounter.increase();
    }

 
    private _changeQuestion = (): void => {
        this._questions.forEach(question => {question.setVisible(false)});
        this._questions[this._paginator.currentPage - 1].setVisible(true).onScreenChange();
        this._checkSubmitButton();
        window.dispatchEvent(new Event('resize'));
    }

    private _checkSubmitButton(): void{
        
        if(this._questions[this._paginator.currentPage - 1]?.isSubmitted){
            this._submitButton.removeInteractive().setAlpha(0.5);
        }else{
            this._submitButton.setInteractive({cursor: 'pointer'}).setAlpha(1);
        }
    }

    private _resetGame = (): void => {
        this._correctAnswerCounter.reset();
        this._questions.forEach(question => {question.destroy()});
        this._questions.length = 0;
        this._questions = [];
        this._finishDialog?.destroy();
        this._timer.reset();
        this._createQuestions();
        this._paginator.reset();
        this._changeQuestion();

        this.onScreenChange();
    }

    public onScreenChange(): void{
        Configs.onScreenChange();
        this._background
        .setPosition(innerWidth / 2, innerHeight / 2)
        .setDisplaySize(innerWidth, innerHeight);

        this._timer.onScreenChange();
        this._correctAnswerCounter.onScreenChange();

        const buttonScale: number = innerWidth < 1001 ? 0.7 : innerWidth > 1920 ? innerWidth / 1920 : 1;

        this._fullScreenButton.setScale(buttonScale).setPosition(innerWidth - 10 * buttonScale, innerHeight - 10 * buttonScale);
        this._playAgainButton.setDisplaySize(50 * buttonScale, 50 * buttonScale).setPosition(10 * buttonScale, innerHeight - 10 * buttonScale);

        this._paginator.onScreenChange();
        this._submitButton.setPosition(innerWidth / 2, innerHeight - 30).setScale(Math.max(0.5, buttonScale));

        this._questions.forEach(question => {
            question.onScreenChange();
            if(question.visible && question.getBounds().height > innerHeight * 0.7){
                question.onScreenChange(question.getBounds().height / innerHeight * 0.9);
            }
        })
    }
}