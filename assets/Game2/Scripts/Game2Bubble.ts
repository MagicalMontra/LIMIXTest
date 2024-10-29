import { _decorator, Component, Node, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game2Bubble')
export class Game2Bubble extends Component {
    public Number(): number
    {
        return this.number;
    }

    @property(Sprite)
    private sprite: Sprite;

    @property([Texture2D])
    private sprites: Texture2D[];

    private number: number;

    public Spawn(number: number): void
    {
        this.number = number;
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = this.sprites[number];
        this.sprite.spriteFrame = spriteFrame;
    }
}


