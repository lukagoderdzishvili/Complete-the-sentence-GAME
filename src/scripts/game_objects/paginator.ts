export class Paginator extends Phaser.GameObjects.Container{
    private _scene: Phaser.Scene;
    private _previousButton!: Phaser.GameObjects.Image;
    private _nextButton!: Phaser.GameObjects.Image;
    private _text!: Phaser.GameObjects.Text;

    private _countPage: number = 5;
    private _currentPage: number = 1;
    private _changeCallBack: () => void;

    constructor(scene: Phaser.Scene, changeCallback: () => void, countPage: number){
        super(scene, innerWidth / 2, 30);
        scene.add.existing(this);
        this._scene = scene;
        this._changeCallBack = changeCallback;
        this._countPage = countPage;
        
        this._draw();
        this._checkState();
        this._addEvents();
    }


    private _draw(): void{
        //BUTTONS
        this._nextButton = this._scene.add.image(76, 0, 'next').setInteractive({cursor: 'pointer'});
        this._previousButton = this._scene.add.image(-76, 0, 'next').setRotation(Phaser.Math.DEG_TO_RAD * 180);
        this.add([this._previousButton, this._nextButton]);


        //TEXT
        this._text = this._scene.add.text(0, 0, `${this._currentPage} of ${this._countPage}`, {fontFamily: 'opensans-regular', fontSize: 20});
        this._text.x -= this._text.displayWidth / 2;
        this._text.y -= this._text.displayHeight / 2;

        this.add(this._text);
    }

    private _addEvents(): void{
        this._nextButton.on('pointerdown', () => { this.nextPage()});

        this._previousButton.on('pointerdown', () => { this.previusPage()});
    }

    private _checkState(): void{
        
        this._text
        .setText(`${this._currentPage} of ${this._countPage}`)
        .setPosition(-this._text.displayWidth / 2, -this._text.displayHeight / 2);

        if(this._currentPage  === 1){
            this._previousButton.setAlpha(0.3);
            this._previousButton.removeInteractive();
        }else{
            this._previousButton.setAlpha(1);
            this._previousButton.setInteractive({cursor: 'pointer'});
        }

        if(this._currentPage === this._countPage){
            this._nextButton.setAlpha(0.3);
            this._nextButton.removeInteractive();
        }else{
            this._nextButton.setAlpha(1);
            this._nextButton.setInteractive({cursor: 'pointer'});
        }
    }

    public nextPage(): void{
        this._currentPage++;
        this._checkState();
        this._changeCallBack();
    }

    public previusPage(): void{
        this._currentPage--;
        this._checkState();
        this._changeCallBack();
    }

    public openPage(index: number): void{
        this._currentPage = index + 1;
        this._checkState();
        this._changeCallBack();
    }

    public get currentPage(): number{
        return this._currentPage;
    }
    
    public get isLastPage(): boolean {
        return this._countPage === this._currentPage;
    }

    public reset(): void{
        this._currentPage = 1;
        this._checkState();
    }


    public onScreenChange(): void{
        const scale: number = innerWidth < 1001 ? 0.7 : innerWidth > 1920 ? innerWidth / 1920 : 1;
        this.setPosition(innerWidth / 2 , 32 * scale).setScale(scale);
    }
}