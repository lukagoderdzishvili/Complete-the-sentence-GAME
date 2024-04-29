import { QuestionConfig } from "../statics/entities";

export class Question extends Phaser.GameObjects.Container {
    private _scene: Phaser.Scene;
    private _textWithouthRect!: Phaser.GameObjects.Text;
    private _textBeforeRect!: Phaser.GameObjects.Text;
    private _textAfterRect!: Phaser.GameObjects.Text;

    private _rect!: Phaser.GameObjects.Image; 

    private _strSizeWithRect: number = 300;

    constructor(scene: Phaser.Scene, config: QuestionConfig) {
        super(scene, innerWidth / 2, innerHeight / 2);
        scene.add.existing(this);
        this._scene = scene;

        this._draw( config.value.split('\n'));
        
    }

    private _draw(strArray: string[]): void{
        strArray.forEach((str, index) => {
            if(str.includes('###')){

                const placeholderIndex = str.indexOf('###');
                // Split the text into two parts: before and after the placeholder
                const textBefore = str.substring(0, placeholderIndex);
                const textAfter = str.substring(placeholderIndex + 3); 

                // Create text objects for each part
                this._textBeforeRect = this._scene.add.text(0, index * (this._strSizeWithRect / 2), textBefore, { fontFamily: 'rubik', fontSize: 50, lineSpacing: 25, align: 'center' }).setResolution(2);
                this._textAfterRect = this._scene.add.text(this._textBeforeRect.displayWidth + (this._strSizeWithRect / 10) * 2 + this._strSizeWithRect, index * 150, textAfter, { fontFamily: 'rubik', fontSize: 50, lineSpacing: 25, align: 'center' }).setResolution(2);
                
                this._rect = this._scene.add.image(this._textBeforeRect.displayWidth + (this._strSizeWithRect / 10) + (this._strSizeWithRect / 2), index * 150 + 25, 'rect').setDisplaySize(this._strSizeWithRect, 100);
                this.add(this._rect);

                this._strSizeWithRect += this._textAfterRect.displayWidth;
                this._strSizeWithRect += this._textBeforeRect.displayWidth;

                this.add([this._textBeforeRect, this._textAfterRect]);
                
            }else{


                this._textWithouthRect = this._scene.add.text(0, index * 150, str, { fontFamily: 'rubik', fontSize: 50, lineSpacing: 25, align: 'center' }).setResolution(2);
                this.add(this._textWithouthRect);
            }
        });

        let maxWidth = 0;
        (<Phaser.GameObjects.Text[]>this.list).forEach((text) => {
            if(text.displayWidth > maxWidth) maxWidth = text.displayWidth;
        });

        maxWidth = Math.max(maxWidth, this._strSizeWithRect);
        (<Phaser.GameObjects.Text[]>this.list).forEach((text) => {
           text.x -= maxWidth / 2;
        });
    }
}
