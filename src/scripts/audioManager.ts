export class AudioManager{
    private _scene: Phaser.Scene;
    public backgroundMusic!: Phaser.Sound.BaseSound;
    public click!: Phaser.Sound.BaseSound;
    public drop!: Phaser.Sound.BaseSound;
    public fail!: Phaser.Sound.BaseSound;
    public gameRestart!: Phaser.Sound.BaseSound;
    public pickup!: Phaser.Sound.BaseSound;
    public success!: Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene){
        this._scene = scene;

        this._scene.game.events.on(Phaser.Core.Events.HIDDEN, () => {
            this._scene.sound.pauseAll();
        });
        this._scene.game.events.on(Phaser.Core.Events.VISIBLE, () => {
            this._scene.sound.resumeAll();
        });

        this._initSounds();
    }


    private _initSounds(): void{
        this.backgroundMusic = this._scene.sound.add('backgroundMusic', {loop: true, volume: 0.7 });
        this.click = this._scene.sound.add('clickSound', { volume: 1 });
        this.drop = this._scene.sound.add('dropSound', { volume: 1 });
        this.fail = this._scene.sound.add('failSound', { volume: 1 });
        this.gameRestart = this._scene.sound.add('gameRestartSound', { volume: 1 });
        this.pickup = this._scene.sound.add('pickupSound', { volume: 1 });
        this.success = this._scene.sound.add('successSound', { volume: 1 });


    }
}