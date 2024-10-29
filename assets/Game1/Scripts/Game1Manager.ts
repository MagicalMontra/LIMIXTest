import { _decorator, AudioSource, Component, EventHandler, instantiate, Mask, Node, Prefab, UITransform, Vec2 } from 'cc';
import { Game1Bubble } from './Game1Bubble';
const { ccclass, property } = _decorator;

@ccclass('Game1Manager')
export class Game1Manager extends Component {
    
    @property(Node)
    private bubbleParent: Node;

    @property(Number)
    private collectionLimit: number = 10; 

    @property(Number)
    private minSpawnRate: number = 0.25; 

    @property(Number)
    private maxSpawnRate: number = 2; 

    @property(Number)
    private bubbleSpeed: number = 1;

    @property(Prefab)
    private bubblePrefab: Prefab | null = null;

    @property(Node)
    private topNode: Node;
    @property(Node)
    private leftNode: Node;
    @property(Node)
    private rightNode: Node;
    @property(Node)
    private bottomNode: Node;

    @property(AudioSource)
    private winSfx: AudioSource;

    @property(AudioSource)
    private collectSfx: AudioSource;

    @property([UITransform])
    private indicators: UITransform[];

    private isGameStarted: boolean;
    private timeToSpawn: number = 0;
    private targetSpawnTime: number = 0;
    private numbers: number[];
    private outIndexes: number[];
    private destroyQueue: number[];
    private objects: Game1Bubble[];

    protected start(): void {
        this.StartGame();
    }

    protected update(dt: number): void {
        if (!this.isGameStarted)
            return;

        if (this.outIndexes.length == this.numbers.length)
            return;

        this.timeToSpawn += dt;

        if (this.timeToSpawn >= this.targetSpawnTime && this.targetSpawnTime > 0)
        {
            let newIndex = this.GetRandomInt(0, this.numbers.length - 1);
            while (this.outIndexes.some(index => index == newIndex))
            {
                if (this.outIndexes.length == this.numbers.length)
                    break;

                newIndex = this.GetRandomInt(0, this.numbers.length - 1);
            }

            if (this.outIndexes.length == this.numbers.length)
                return;

            this.Spawn(newIndex);
            this.timeToSpawn = 0;
            this.targetSpawnTime = 0;
        }

        if (this.targetSpawnTime <= 0)
            this.targetSpawnTime = this.GetRandomInt(this.minSpawnRate, this.maxSpawnRate);

        if (this.objects.length <= 0)
            return;

        for (let index = 0; index < this.objects.length; index++) {
            if (!this.isGameStarted)
                return;

            const element = this.objects[index];

            if (!this.isGameStarted)
                return;

            element.node.setPosition(element.node.position.x, element.node.position.y + this.bubbleSpeed);

            if (!this.isGameStarted)
                return;

            if (element.node.position.y > this.topNode.position.y)
            {
                if (!this.isGameStarted)
                    return;

                this.destroyQueue.push(index);
            }
        }

        if (this.destroyQueue.length <= 0)
            return;

        for (let index = 0; index < this.destroyQueue.length; index++) {
            const element = this.objects[this.destroyQueue[index]];
            element.node.destroy();
            this.objects.splice(this.destroyQueue[index], 1);
        }

        this.destroyQueue = [];
    }

    public StartGame(): void
    {
        this.objects = [];
        this.numbers = [];
        this.outIndexes = [];
        this.destroyQueue = [];

        for (let index = 0; index < 5; index++)
            this.numbers.push(0);

        this.isGameStarted = true;
        this.targetSpawnTime = this.GetRandomInt(this.minSpawnRate, this.maxSpawnRate);

        for (let index = 0; index < this.indicators.length; index++) {
            const element = this.indicators[index];
            element.getComponent(Mask).enabled = false;
            element.contentSize.set(100, 0);
            element.getComponent(Mask).enabled = true;
        }
    }

    public StopGame(): void
    {
        this.isGameStarted = false;

        for (let index = 0; index < this.objects.length; index++) {
            const element = this.objects[index];
            element.node.destroy();
        }

        this.objects = [];
        this.numbers = [];
        this.outIndexes = [];
        this.destroyQueue = [];
        this.winSfx.playOneShot(this.winSfx.clip);
    }

    private Spawn(number: number): void
    {
        const randomX = this.GetRandomInt(this.leftNode.position.x, this.rightNode.position.x);
        const newObj = instantiate(this.bubblePrefab);
        const bubble = newObj.getComponent(Game1Bubble);
        bubble.Spawn(number);
        this.bubbleParent.addChild(newObj);
        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = 'Game1Manager';
        eventHandler.handler = 'OnBubbleClicked';
        eventHandler.customEventData = number.toString();
        bubble.Button.clickEvents.push(eventHandler)
        newObj.setPosition(randomX, this.bottomNode.position.y);
        this.objects.push(bubble);
    }

    private GetRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public OnBubbleClicked(event: Event, customEventData: string): void
    {
        const bubbleNode = event.currentTarget as unknown as Node;
        const numberIndex = Number.parseInt(customEventData);
        const index = this.objects.findIndex(item => item.node == bubbleNode);
        this.objects.splice(index, 1);

        if (this.numbers[numberIndex] >= this.collectionLimit)
        {
            bubbleNode.destroy();
            return;
        }

        this.numbers[numberIndex] += 1;
        this.collectSfx.playOneShot(this.collectSfx.clip);
        const indicator = this.indicators[numberIndex];
        indicator.getComponent(Mask).enabled = false;
        indicator.contentSize.set(100, (this.numbers[numberIndex] / this.collectionLimit) * 100);
        indicator.getComponent(Mask).enabled = true;

        if (this.numbers[numberIndex] >= this.collectionLimit)
            this.outIndexes.push(numberIndex);

        bubbleNode.destroy();

        if (this.outIndexes.length == this.numbers.length)
        {
            this.StopGame();
        }
    }
}


