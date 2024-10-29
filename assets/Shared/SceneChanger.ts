import { _decorator, AudioSource, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneChanger')
export class SceneChanger extends Component {
    @property(AudioSource)
    private buttonSfx: AudioSource;

    public Change(event: Event, customEventData: string): void
    {
        director.loadScene(customEventData);
        this.buttonSfx.playOneShot(this.buttonSfx.clip);
    }
}


