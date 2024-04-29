export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        
    }

    public preload(): void {
        this.load.pack("asset-pack", '/assetsPack.json');

        this.load.on('complete', this.complete, this);
    }


    public complete(): void {
        this.scene.start('StartScene');
        window.dispatchEvent(new Event('resize'));
    }
}