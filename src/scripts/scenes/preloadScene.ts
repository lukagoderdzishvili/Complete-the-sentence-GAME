export default class PreloadScene extends Phaser.Scene {
    private _theme: string
    constructor(theme: string) {
        super({ key: 'PreloadScene' });
        this._theme = theme        
    }

    public preload(): void {
        this.load.pack("asset-pack", "/assetsPack.json");
        this.load.pack('theme2', `/${this._theme}.json`);
        this._loadFont("opensans-extrabold", "assets/fonts/opensans-extrabold.woff2");
        this._loadFont("opensans-regular", "assets/fonts/opensans-regular.woff2");
        this._loadFont("opensans-semibold", "assets/fonts/opensans-semibold.woff2");
        this._loadFont("teko-semibold", "assets/fonts/teko-semibold.woff2");
        this._loadFont("rubik", "assets/fonts/hebrew/rubik-bold.woff2");

        this.load.html('finishDialog', 'partials/finishDialog.html');

        this.load.on('complete', this.complete, this);
    }

    private _loadFont(name: string, url: string): void {
        const newFont = new FontFace(name, `url(${url})`);
        newFont.load().then(function (loaded) {
            
            (<any>document.fonts).add(loaded);
        }).catch(function (error) {
            return error;
        })
    }


    public complete(): void {
        document.getElementById('loader')?.remove();        
        this.scene.start('MainScene');
        window.dispatchEvent(new Event('resize'));
    }
}