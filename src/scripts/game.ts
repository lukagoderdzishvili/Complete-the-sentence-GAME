import Phaser from "phaser";
import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";
import Configs from "./statics/configs";
import StartScene from "./scenes/startScene";
import settings from '../../public/settings.json' assert { type: 'json' };
import questions from '../../public/questions.json' assert { type: 'json' };

export default class Game {
    private _config: Phaser.Types.Core.GameConfig;
    private _preloadScene: PreloadScene;
    private _startScene: StartScene;
    private _mainScene: MainScene;
    private _gameObject: Phaser.Game;

    constructor() {
        this._config = Configs.gameConfig;
        this._setConfigFromJSON();
         

        this._preloadScene = new PreloadScene(settings.data.theme);
        this._startScene = new StartScene();
        this._mainScene = new MainScene(questions);
    

        this._config.scene = [this._preloadScene, this._startScene, this._mainScene];
        this._gameObject = new Phaser.Game(this._config);
        
        this._addListeners();

    }

    private _setConfigFromJSON(): void{
        Configs.fontFamily = settings.data.font;
        Configs.shuffleQuestions = settings.data.shuffleQuestions;
        if(
            settings.data.UIComponentsColor === 'white' ||
            settings.data.UIComponentsColor === 'black'     
        ){
            Configs.uiComponentsColor = settings.data.UIComponentsColor;
            Configs.paginator.textStyle.color = settings.data.UIComponentsColor;
            Configs.correctAnswerCounter.textStyle.color = settings.data.UIComponentsColor;
            Configs.timer.textStyle.color = settings.data.UIComponentsColor; 
        }

        if(
            settings.data.answersTextColor === 'white' ||
            settings.data.answersTextColor === 'black'     
        ){
            Configs.answersTextColor = settings.data.answersTextColor;
        }

        if(
            settings.data.questionsTextColor === 'white' ||
            settings.data.questionsTextColor === 'black'     
        ){
            Configs.questionsTextColor = settings.data.questionsTextColor;
        }

    }

    private _addListeners(): void {
        window.addEventListener('resize', () => {
            
            if(this._gameObject.scene.isActive('StartScene')){
                this._startScene.onScreenChange();
            }else if(this._gameObject.scene.isActive('MainScene'))
            this._mainScene.onScreenChange();
        });
    }
}