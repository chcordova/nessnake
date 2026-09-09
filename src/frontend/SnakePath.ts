export type SnakeDirection = "up" | "down" | "left" | "right";

export interface PathPoint {
  x: number;
  y: number;
}

export interface SnakePathState {
  segments: PathPoint[];
  direction: SnakeDirection;
}

export type ClassifiedSegmentType = "head" | "body" | "corner" | "tail";

export interface ClassifiedPathSegment extends PathPoint {
  type: ClassifiedSegmentType;
  direction?: SnakeDirection;
  incoming?: SnakeDirection;
  outgoing?: SnakeDirection;
}

const directionVectors: Record<SnakeDirection, PathPoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function isOpposite(first: SnakeDirection, second: SnakeDirection): boolean {
  return (
    (first === "up" && second === "down") ||
    (first === "down" && second === "up") ||
    (first === "left" && second === "right") ||
    (first === "right" && second === "left")
  );
}

function directionBetween(
  from: PathPoint,
  to: PathPoint
): SnakeDirection | undefined {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (deltaX === 0 && deltaY < 0) return "up";
  if (deltaX === 0 && deltaY > 0) return "down";
  if (deltaY === 0 && deltaX < 0) return "left";
  if (deltaY === 0 && deltaX > 0) return "right";
  return undefined;
}

export function createSnakePath(
  segments: PathPoint[],
  direction: SnakeDirection
): SnakePathState {
  if (segments.length === 0) {
    throw new Error("A snake path requires at least one segment");
  }

  return {
    segments: segments.map((segment) => ({ ...segment })),
    direction,
  };
}

export function advanceSnakePath(
  state: SnakePathState,
  requestedDirection: SnakeDirection,
  step: number,
  maxLength: number
): SnakePathState {
  if (step <= 0) throw new Error("Snake path step must be positive");
  if (maxLength <= 0) throw new Error("Snake path maxLength must be positive");

  const direction =
    state.segments.length > 1 && isOpposite(state.direction, requestedDirection)
      ? state.direction
      : requestedDirection;
  const head = state.segments[0];
  if (!head) throw new Error("A snake path requires a head segment");

  const vector = directionVectors[direction];
  const nextSegments = [
    { x: head.x + vector.x * step, y: head.y + vector.y * step },
    ...state.segments,
  ].slice(0, maxLength);

  return { segments: nextSegments, direction };
}

export function classifySnakePath(
  state: SnakePathState
): ClassifiedPathSegment[] {
  return state.segments.map((segment, index, segments) => {
    if (index === 0) {
      return {
        ...segment,
        type: "head",
        direction: state.direction,
      };
    }

    if (index === segments.length - 1) {
      const previous = segments[index - 1];
      return {
        ...segment,
        type: "tail",
        direction: previous ? directionBetween(segment, previous) : undefined,
      };
    }

    const previous = segments[index - 1];
    const next = segments[index + 1];
    if (!previous || !next) return { ...segment, type: "body" };

    const incoming = directionBetween(previous, segment);
    const outgoing = directionBetween(segment, next);
    if (incoming && outgoing && incoming === outgoing) {
      return { ...segment, type: "body", direction: incoming };
    }

    return {
      ...segment,
      type: "corner",
      incoming,
      outgoing,
    };
  });
}
