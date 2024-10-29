const { ccclass, property } = _decorator;
import { _decorator, AudioSource, Component, EventHandler, instantiate, Mask, Node, Prefab, UITransform } from 'cc';
import { Game2Bubble } from './Game2Bubble';
import { Game2Catcher } from './Game2Catcher';

@ccclass('Game2Manager')
export class Game2Manager extends Component {
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

    @property(Game2Catcher)
    private catcher: Game2Catcher;

    @property([UITransform])
    private indicators: UITransform[];

    private isGameStarted: boolean;
    private timeToSpawn: number = 0;
    private targetSpawnTime: number = 0;
    private numbers: number[];
    private outIndexes: number[];
    private destroyQueue: number[];
    private objects: Game2Bubble[];

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
            element.node.setPosition(element.node.position.x, element.node.position.y - this.bubbleSpeed);

            if (element.node.position.y <= this.catcher.node.position.y + 50 && element.node.position.y > this.catcher.node.position.y)
            {
                if (!this.isGameStarted)
                    return;

                const leftPos = this.catcher.node.position.x + this.catcher.leftNode.position.x;
                const rightPos = this.catcher.node.position.x + this.catcher.rightNode.position.x;

                if (!this.isGameStarted)
                    return;

                if (element.node.position.x > leftPos && element.node.position.x < rightPos)
                {
                    if (!this.isGameStarted)
                        return;

                    this.OnCatch(index);

                    if (!this.isGameStarted)
                        return;

                    this.destroyQueue.push(index);
                    continue;
                }
            }

            if (element.node.position.y < this.bottomNode.position.y)
            {
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
        const bubble = newObj.getComponent(Game2Bubble);
        bubble.Spawn(number);
        this.bubbleParent.addChild(newObj);
        newObj.setPosition(randomX, this.topNode.position.y);
        this.objects.push(bubble);
    }

    private GetRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public OnCatch(index: number): void
    {
        const numberIndex = this.objects[index].getComponent(Game2Bubble).Number();

        if (this.numbers[numberIndex] >= this.collectionLimit)
            return;

        this.numbers[numberIndex] += 1;
        this.collectSfx.playOneShot(this.collectSfx.clip);
        const indicator = this.indicators[numberIndex];
        indicator.getComponent(Mask).enabled = false;
        indicator.contentSize.set(100, (this.numbers[numberIndex] / this.collectionLimit) * 100);
        indicator.getComponent(Mask).enabled = true;

        if (this.numbers[numberIndex] >= this.collectionLimit)
            this.outIndexes.push(numberIndex);

        if (this.outIndexes.length == this.numbers.length)
        {
            this.StopGame();
        }
    }
}


