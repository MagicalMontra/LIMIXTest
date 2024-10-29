import { _decorator, Component, Label, Node, Vec2, Button, EventHandler, Sprite, Texture2D, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Game1Bubble extends Component {
    @property(Button)
    public Button: Button;

    @property(Sprite)
    private sprite: Sprite;

    @property([Texture2D])
    private sprites: Texture2D[];

    public Spawn(number: number): void
    {
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = this.sprites[number];
        this.sprite.spriteFrame = spriteFrame;
    }
}


