describe('フロントエンド基本テスト', () => {
  test('文字列の結合', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
  });

  test('DOM要素のテスト', () => {
    document.body.innerHTML = '<div id="test">テスト要素</div>';
    const element = document.getElementById('test');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('テスト要素');
  });
}); 