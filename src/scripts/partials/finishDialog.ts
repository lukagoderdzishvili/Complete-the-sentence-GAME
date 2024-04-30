export class FinishDialog extends Phaser.GameObjects.DOMElement{
    private _playAgainButton!: HTMLElement | null;
    private _timeElement!: HTMLElement | null;
    private answersElement!: HTMLElement | null;

    private _playAgainCallback: () => void;
    private _answersValue: string;
    private _timeValue: string;
    

    constructor(scene: Phaser.Scene, answers: string, time: string, playAgainCallBack: () => void){
        super(scene, 0, 0);
        scene.add.existing(this);
        this._answersValue = answers;
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
        this.answersElement = this.node.querySelector('#answersElement');
    }

    private _setData(): void{
        if(this._timeElement)this._timeElement.innerHTML = this._timeValue;
        if(this.answersElement)this.answersElement.innerHTML = this._answersValue;
    }

    private _addEvent(): void{
        this._playAgainButton?.addEventListener('click', () => {this._playAgainCallback()});
    }
}