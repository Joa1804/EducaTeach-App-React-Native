import { embaralhar, embaralharDiferente } from '../embaralhar';

describe('embaralhar', () => {
  it('mantém os mesmos itens sem alterar o original', () => {
    const original = [1, 2, 3, 4, 5];
    const resultado = embaralhar(original);
    expect([...resultado].sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('embaralharDiferente', () => {
  it('nunca devolve uma ordem proibida', () => {
    for (let i = 0; i < 50; i += 1) {
      const resultado = embaralharDiferente(['a', 'b', 'c'], [['a', 'b', 'c']]);
      expect(resultado).not.toEqual(['a', 'b', 'c']);
    }
  });

  it('usa a rotação quando o aleatório insiste na ordem proibida', () => {
    // Com aleatório sempre ~1, Fisher–Yates não troca nada.
    expect(embaralharDiferente(['a', 'b', 'c'], [['a', 'b', 'c']], () => 0.999)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('devolve cópia quando há menos de dois itens', () => {
    expect(embaralharDiferente(['a'], [['a']])).toEqual(['a']);
  });
});
