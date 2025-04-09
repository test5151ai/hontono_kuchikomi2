describe('基本的なテスト', () => {
  test('1 + 1 は 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('オブジェクトの比較', () => {
    const data = { one: 1 };
    data['two'] = 2;
    expect(data).toEqual({ one: 1, two: 2 });
  });
}); 