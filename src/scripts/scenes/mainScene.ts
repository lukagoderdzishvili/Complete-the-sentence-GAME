import { AudioManager } from "../audioManager";
import { Question } from "../game_objects/question";
import data from '../../../public/questions.json' assert { type: 'json' };

export default class MainScene extends Phaser.Scene{
    private _audioManager!: AudioManager;
    private _background!: Phaser.GameObjects.Image;
    private _testQuestion!: Question;
    private _questions: {value: string}[] = data.list;

    constructor(){
        super({ key: 'MainScene' });
    }


    public create(): void{
        this._audioManager = new AudioManager(this);
        console.log

        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this._background = this.add
        .image(innerWidth / 2, innerHeight / 2, 'background').setDisplaySize(innerWidth, innerHeight);

        //FOR TESTING
        this._testQuestion = new Question(this, {
            position: {
                x: innerWidth / 2,
                y: innerHeight / 2
            },
            str: this._questions[0].value
        }).setScale(innerWidth / 1920);
        this.add.existing(this._testQuestion);
    }


    public onScreenChange(): void{
        console.log('resize mainscene');
        this._background.setPosition(innerWidth / 2, innerHeight / 2).setDisplaySize(innerWidth, innerHeight);
        this._testQuestion.setPosition(innerWidth / 2, innerHeight / 2).setScale(innerWidth / 1920);
    }
}