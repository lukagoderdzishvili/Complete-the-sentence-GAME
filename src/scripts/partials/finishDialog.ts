export class FinishDialog extends Phaser.GameObjects.DOMElement{
    private _playAgainButton!: HTMLElement | null;
    private _timeElement!: HTMLElement | null;
    private _answersElement!: HTMLElement | null;
    private _statusTitleElement!: HTMLElement | null;

    private _playAgainCallback: () => void;
    private _answersValue: string;
    private _countAnswersValue: number;
    private _timeValue: string;
    private _isCountDown: boolean;
    

    constructor(scene: Phaser.Scene, answers: string, countAnswers: number, time: string, isCountDown: boolean, playAgainCallBack: () => void){
        super(scene, 0, 0);
        scene.add.existing(this);
        this._answersValue = answers;
        this._countAnswersValue = countAnswers;
        this._isCountDown = isCountDown;

        this._timeValue = time;
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
        this._statusTitleElement = this.node.querySelector('#answersElement');
    }

    private _setData(): void{
        if(this._timeElement)this._timeElement.innerHTML = this._timeValue;
        if(this._answersElement)this._answersElement.innerHTML = `${this._answersValue} / ${this._countAnswersValue}`;
        if(this._statusTitleElement && this._isCountDown)this._statusTitleElement.innerHTML = "TIME'S UP"; 
    }

    private _addEvent(): void{
        this._playAgainButton?.addEventListener('click', () => {this._playAgainCallback()});
    }
}