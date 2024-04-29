export class Answer extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, config: any){
        super(scene, config.position.x, config.position.y);
        this._scene = scene;
        
    }
}