import Configs from "../statics/configs";

export class Timer extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;

    private _initialTime: number = 0;
    private _text!: Phaser.GameObjects.Text;
    private _timerEvent!: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene){
        super(scene, 15, 10);
        scene.add.existing(this);
        this._scene = scene;
      
        this._create();
    }


    private _create(): void{
        this._text = this._scene.add.text(0, 0, this._formatTime(this._initialTime), Configs.timer.textStyle)
        .setOrigin(Configs.timer.origin.x, Configs.timer.origin.y);
        
        this.add(this._text);
        // Each 1000 ms call onEvent
        this._timerEvent = this._scene.time.addEvent({ delay: 1000, callback: this._onEvent, callbackScope: this, loop: true });
    
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
    
    
    private  _onEvent(): void{
        this._initialTime += 1; // One second
        this._text.setText(this._formatTime(this._initialTime));
    }

    public pause(): void{
        this._timerEvent.paused = true;
    }

    public reset(): void{
        this._timerEvent.destroy();
        this._text.destroy();

        this._initialTime = 0;
        this._create();
    }

    public get value(): string{
        return this._text.text;
    }


    public onScreenChange(): void{
        const scale: number = innerWidth < 1001 ? 0.7 : innerWidth > 1920 ? innerWidth / 1920 : 1;
        this.setPosition( 15 * scale, 10 * scale).setScale(scale);
    }
}