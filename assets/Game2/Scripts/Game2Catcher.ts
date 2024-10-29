import { _decorator, Camera, Component, EventMouse, EventTouch, input, Input, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game2Catcher')
export class Game2Catcher extends Component {
    @property(Node)
    public leftNode: Node;

    @property(Node)
    public rightNode: Node;
    
    @property(Camera)
    private mainCamera: Camera | null = null; // Reference to the main camera

    private isHolding: boolean = false;

    onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onMouseDown(event: EventMouse) {
        this.isHolding = true;
    }

    onMouseUp(event: EventMouse) {
        this.isHolding = false;
    }

    onMouseMove(event: EventMouse) {
        if (this.isHolding) {
            this.moveToEventPosition(event.getLocationX());
        }
    }

    onTouchStart(event: EventTouch) {
        this.isHolding = true;
    }

    onTouchEnd(event: EventTouch) {
        this.isHolding = false;
    }

    onTouchMove(event: EventTouch) {
        if (this.isHolding) {
            const touchPos = event.getLocation();
            this.moveToEventPosition(touchPos.x);
        }
    }

    private moveToEventPosition(screenX: number) {
        const worldPosition = this.mainCamera.screenToWorld(new Vec3(screenX, screenY, 0));
        const parentTransform = this.node.parent!.getComponent(UITransform);

        if (!parentTransform)
            return;

        const localPosition = parentTransform.convertToNodeSpaceAR(worldPosition);
        this.node.setPosition(new Vec3(localPosition.x, this.node.position.y, 0));
    }
}


