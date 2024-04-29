import { AudioManager } from "../audioManager";
import { Question } from "../game_objects/question";
import { Paginator } from "../game_objects/paginator";
import * as Entities from '../statics/entities';
import data from '../../../public/questions.json' assert { type: 'json' };

export default class MainScene extends Phaser.Scene{
    private _audioManager!: AudioManager;
    private _background!: Phaser.GameObjects.Image;
    private _paginator!: Paginator;

    private _gameData: Entities.GameData = data;
    private _questions: Question[] = [];

    constructor(){
        super({ key: 'MainScene' });
    }


    public create(): void{
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this._background = this.add.image(innerWidth / 2, innerHeight / 2, 'background').setDisplaySize(innerWidth, innerHeight);

        this._audioManager = new AudioManager(this);
        this._paginator = new Paginator(this, this._changeQuestion, this._gameData.list.length);
        
        this._gameData.list.forEach((data) => {
            const question = new Question(this, data).setVisible(false);
            this._questions.push(question);
        });

        this._changeQuestion();

        this.onScreenChange();
    }

    private _changeQuestion = (): void => {
        
        this._questions.forEach(question => {question.setVisible(false)});

        this._questions[this._paginator.currentPage - 1].setVisible(true);
    }

    public onScreenChange(): void{
        this._background
        .setPosition(innerWidth / 2, innerHeight / 2)
        .setDisplaySize(innerWidth, innerHeight);

        this._paginator.onScreenChange();

        this._questions.forEach(question => {
            question.onScreenChange();
        })
    }
}