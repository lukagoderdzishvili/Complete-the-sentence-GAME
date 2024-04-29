export class AudioManager{
    private _scene: Phaser.Scene;
    private _backgroundMusic!: Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene){
        this._scene = scene;

        this._scene.game.events.on(Phaser.Core.Events.HIDDEN, () => {
            this._scene.sound.pauseAll();
        });
        this._scene.game.events.on(Phaser.Core.Events.VISIBLE, () => {
            this._scene.sound.resumeAll();
        });

        this._initSounds();
        this._backgroundMusic.play();
    }


    private _initSounds(): void{
        this._backgroundMusic = this._scene.sound.add('backgroundMusic', {loop: true, volume: 1 });


    }
}