import Configs from "../statics/configs";

export class FinishDialog extends Phaser.GameObjects.DOMElement{
    private _playAgainButton!: HTMLElement | null;
    private _timeElement!: HTMLElement | null;
    private _answersElement!: HTMLElement | null;
    private _statusTitleElement!: HTMLElement | null;

    private _playAgainCallback: () => void;
    private _answersValue: string;
    private _countAnswersValue: number;
    private _timeValue: string;
    

    constructor(scene: Phaser.Scene, answers: string, countAnswers: number, time: number, playAgainCallBack: () => void){
        super(scene, 0, 0);
        scene.add.existing(this);
        this._answersValue = answers;
        this._countAnswersValue = countAnswers;

        this._timeValue = this._formatTime(time);
        this._playAgainCallback = playAgainCallBack;

        this.createFromCache('finishDialog');
        this._initElements();
        this._setData();
        this._addEvent();
    }




    private _initElements(): void{
        this._playAgainButton = this.node.querySelector('button');
        this._timeElement = this.node.querySelector('#timeElement');
        this._answersElement = this.node.querySelector('#answersElement');
        this._statusTitleElement = this.node.querySelector('#statusTitle');
    }

    private _formatTime(seconds: number){
        // Minutes
        const minutes = Math.floor(seconds/60);
        // Seconds
        let partInSeconds = (seconds % 60).toString();
        // Adds left zeros to seconds
        partInSeconds = partInSeconds.toString().padStart(2,'0');
        // Returns formated time
        return `${minutes}:${partInSeconds}`;
    }

    private _setData(): void{
        if(this._timeElement)this._timeElement.innerHTML = this._timeValue;
        if(this._answersElement)this._answersElement.innerHTML = `${this._answersValue} / ${this._countAnswersValue}`;
        if(this._statusTitleElement && Configs.timer.isCountDown)this._statusTitleElement.innerHTML = "TIME'S UP"; 
    }

    private _addEvent(): void{
        this._playAgainButton?.addEventListener('click', () => {this._playAgainCallback()});
    }
}