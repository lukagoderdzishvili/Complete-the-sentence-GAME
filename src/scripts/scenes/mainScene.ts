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
    private _soundButton!: Phaser.GameObjects.Image;
    private _layoutSwitchButton!: Phaser.GameObjects.Image;
    private _playAgainButton!: Phaser.GameObjects.Image;

    constructor(gameData: Entities.GameData){
        super({ key: 'MainScene' });
        this._gameData = gameData;

        if(Configs.shuffleQuestions)this._shuffleQuestions();
    }   


    public create(): void{
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this._background = this.add.image(innerWidth / 2, innerHeight / 2, 'background').setDisplaySize(innerWidth, innerHeight);


        this._audioManager = new AudioManager(this);
        this._timer = new Timer(this);
        this._audioManager.backgroundMusic.play();
        
        this._paginator = new Paginator(this, this._audioManager, this._changeQuestion, this._gameData.list.length);
        this._correctAnswerCounter = new CorrectAnswerCounter(this);
        
        this._addEvents();
        this._createQuestions();
        this._createSubmitButton();
       
        this._changeQuestion();
        this._createFullScreenButton();
        this._createSoundButton();
        this._createLayoutSwitchButton()
        this._createPlayAgainButton();

        this.onScreenChange();
    }

    private _addEvents(): void{
        this.events.on('FinishGame', this._finishGame, this);
    }

    private _shuffleQuestions(): void{
        this._gameData.list = Phaser.Utils.Array.Shuffle(this._gameData.list);

    }

    private _createQuestions(): void{
        this._gameData.list.forEach((data, index) => {
            const question = new Question(this, this._audioManager, data, index === 0).setVisible(false);
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
        if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream)return; //iOS DOES NOT SUPPORT FULLSCREEN

        this._fullScreenButton = this.add
        .image(innerWidth - 10, innerHeight - 10, Configs.fullScreenButton.texture + '-' + Configs.uiComponentsColor)
        .setDisplaySize(Configs.fullScreenButton.width, Configs.fullScreenButton.height)
        .setOrigin(Configs.fullScreenButton.origin.x, Configs.fullScreenButton.origin.y)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            toggleFullScreen();
        });
    }

    private _createSoundButton(): void{
        this._soundButton = this.add
        .image((this._fullScreenButton?.getBounds().left ?? innerWidth) - 20, innerHeight - 10, Configs.soundButton.texture.enabled)
        .setDisplaySize(10, 10)
        .setOrigin(Configs.soundButton.origin.x, Configs.soundButton.origin.y)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this.sound.setMute(!this.sound.mute);
            this._soundButton.setTexture(Configs.soundButton.texture[this.sound.mute ? 'disabled' : 'enabled']);
        });
    }

    private _createLayoutSwitchButton(): void{
        
        this._layoutSwitchButton = this.add
        .image(innerWidth - 10, innerHeight / 2, Configs.layoutSwitchButton.texture + '-' + Configs.uiComponentsColor)
        .setDisplaySize(Configs.layoutSwitchButton.width, Configs.layoutSwitchButton.height)
        .setOrigin(Configs.layoutSwitchButton.origin.x, Configs.layoutSwitchButton.origin.y)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this._audioManager.click.play();
            const question = this._questions.find((item) => item.visible);
            if(question){
                const currentLayout = question.switchLayout();
                this._layoutSwitchButton.setRotation(currentLayout === 'column' ? 0 : Phaser.Math.DEG_TO_RAD * 90);
            }
        });
    }

    private _createPlayAgainButton(): void{
        this._playAgainButton = this.add
        .image(10, innerHeight - 10, Configs.playAgainButton.texture)
        .setDisplaySize(Configs.playAgainButton.width, Configs.playAgainButton.height)
        .setOrigin(Configs.playAgainButton.origin.x, Configs.playAgainButton.origin.y)
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => {
            this._audioManager.gameRestart.play();
            this._resetGame(); 
        });
    }

    private async _submitAnswer(): Promise<void>{
        if(this._questions[this._paginator.currentPage - 1].isSubmitted) return;
        let isCorrect: boolean =  await this._questions[this._paginator.currentPage - 1].submit();
        
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
        this._finishDialog = new FinishDialog(this, this._correctAnswerCounter.text, this._questions.length, this._timer.value, this._resetGame);
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
        
        if(Configs.shuffleQuestions)this._shuffleQuestions();

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

        this._fullScreenButton?.setScale(buttonScale)?.setPosition(innerWidth - 10 * buttonScale, innerHeight - 10 * buttonScale);
        this._soundButton?.setDisplaySize(Configs.soundButton.width * buttonScale, Configs.soundButton.height * buttonScale).setPosition((this._fullScreenButton?.getBounds().left ?? innerWidth) - 20 * buttonScale, innerHeight - 10 * buttonScale);
        this._layoutSwitchButton.setDisplaySize(Configs.layoutSwitchButton.width * buttonScale, Configs.layoutSwitchButton.height * buttonScale).setPosition(innerWidth - 20 * buttonScale - Configs.layoutSwitchButton.width * buttonScale / 2, innerHeight / 2);
        this._playAgainButton.setDisplaySize(Configs.playAgainButton.width * buttonScale, Configs.playAgainButton.height * buttonScale).setPosition(10 * buttonScale, innerHeight - 10 * buttonScale);

        this._paginator.onScreenChange();
        this._submitButton.setPosition(innerWidth / 2, innerHeight - Math.max(30, Configs.webScale * 40)).setScale(Math.max(0.5, buttonScale));

        this._questions.forEach(question => {
            question.onScreenChange();
            if(question.visible && question.getBounds().height > innerHeight * 0.7){
                question.onScreenChange(question.getBounds().height / innerHeight * 0.9);
            }
        })
    }
}