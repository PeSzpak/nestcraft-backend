export function add(x: number, y: number) {
  return x + y;
}

describe('initial test', () => {
  it('add functio', () => {
    expect(add(10, 5)).toEqual(15);
  });
});
