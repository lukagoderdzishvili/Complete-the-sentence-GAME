import Phaser from "phaser";
import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";
import Configs from "./statics/configs";
import StartScene from "./scenes/startScene";
import data from '../../public/questions.json' assert { type: 'json' };

export default class Game {
    private _config: Phaser.Types.Core.GameConfig;
    private _preloadScene: PreloadScene;
    private _startScene: StartScene;
    private _mainScene: MainScene;
    private _gameObject: Phaser.Game;

    constructor() {
        this._config = Configs.gameConfig;

        this._preloadScene = new PreloadScene('theme1');
        this._startScene = new StartScene();
        this._mainScene = new MainScene(data);
    

        this._config.scene = [this._preloadScene, this._startScene, this._mainScene];
        this._gameObject = new Phaser.Game(this._config);
        
        this._addListeners();

    }

    private _addListeners(): void {
        this._gameObject.scale.on('resize', () => {
            
            if(this._gameObject.scene.isActive('StartScene')){
                this._startScene.onScreenChange();
            }else if(this._gameObject.scene.isActive('MainScene'))
            this._mainScene.onScreenChange();
        });
    }
}