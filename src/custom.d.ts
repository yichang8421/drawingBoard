interface MouseEvent extends Event {
    target: MouseEvent & EventTarget & HTMLMapElement;
}

interface CanvasRenderingContext2D {
    radius: number;
}

type PreviousPoint = {
    x?:number,
    y?:number
}