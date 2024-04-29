export class Question extends Phaser.GameObjects.Container {
    private _scene: Phaser.Scene;
    private _textWithouthRect!: Phaser.GameObjects.Text;
    private _textBeforeRect!: Phaser.GameObjects.Text;
    private _textAfterRect!: Phaser.GameObjects.Text;

    private _rect!: Phaser.GameObjects.Image; 

    constructor(scene: Phaser.Scene, config: any) {
        super(scene, config.position.x, config.position.y);
        this._scene = scene;


      //  let str: string = `I couldn't see her anywhere because \n it was getting ### foggy.`;
        // let str: string = `I can't carry this suitcase \n it is ### heavy.`;

      
        let strArr: string[] = config.str.split('\n');

        let strSizeWithRect: number = 300;
        
        strArr.forEach((str, index) => {
            if(str.includes('###')){

                const placeholderIndex = str.indexOf('###');
                // Split the text into two parts: before and after the placeholder
                const textBefore = str.substring(0, placeholderIndex);
                const textAfter = str.substring(placeholderIndex + 3); 

                // Create text objects for each part
                this._textBeforeRect = this._scene.add.text(0, index * 150, textBefore, { fontFamily: 'rubik', fontSize: 50, lineSpacing: 25, align: 'center' });
                this._textAfterRect = this._scene.add.text(this._textBeforeRect.displayWidth + 30 * 2 + 300, index * 150, textAfter, { fontFamily: 'rubik', fontSize: 50, lineSpacing: 25, align: 'center' });
                
                this._rect = this._scene.add.image(this._textBeforeRect.displayWidth + 30 + 150, index * 150 + 25, 'rect').setDisplaySize(300, 100);
                this.add(this._rect);

                strSizeWithRect += this._textAfterRect.displayWidth;
                strSizeWithRect += this._textBeforeRect.displayWidth;

                this.add([this._textBeforeRect, this._textAfterRect]);
                
            }else{


                this._textWithouthRect = this._scene.add.text(0, index * 150, str, { fontFamily: 'rubik', fontSize: 50, lineSpacing: 25, align: 'center' });
                this.add(this._textWithouthRect);
            }
        });

        let maxWidth = 0;
        (<Phaser.GameObjects.Text[]>this.list).forEach((text) => {
            if(text.displayWidth > maxWidth) maxWidth = text.displayWidth;
        });

        maxWidth = Math.max(maxWidth, strSizeWithRect);
        (<Phaser.GameObjects.Text[]>this.list).forEach((text) => {
           text.x -= maxWidth / 2;
        });

    }
}
