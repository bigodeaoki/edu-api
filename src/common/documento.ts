/** Remove tudo que não é dígito. */
export const apenasDigitos = (s: string): string => (s ?? '').replace(/\D/g, '');

export type TipoPessoa = 'PF' | 'PJ';

/** Valida CPF (11 dígitos) com dígitos verificadores. */
export function validarCPF(s: string): boolean {
  const cpf = apenasDigitos(s);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais

  const calcDV = (slice: string, fatorInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < slice.length; i++) {
      soma += parseInt(slice[i], 10) * (fatorInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const dv1 = calcDV(cpf.slice(0, 9), 10);
  const dv2 = calcDV(cpf.slice(0, 10), 11);
  return dv1 === parseInt(cpf[9], 10) && dv2 === parseInt(cpf[10], 10);
}

/** Valida CNPJ (14 dígitos) com dígitos verificadores. */
export function validarCNPJ(s: string): boolean {
  const cnpj = apenasDigitos(s);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calc = (slice: string, pesos: number[]): number => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) {
      soma += parseInt(slice[i], 10) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = calc(cnpj.slice(0, 12), pesos1);
  const dv2 = calc(cnpj.slice(0, 13), pesos2);
  return dv1 === parseInt(cnpj[12], 10) && dv2 === parseInt(cnpj[13], 10);
}

export interface DocumentoInfo {
  valido: boolean;
  tipo: TipoPessoa | null;
  digitos: string;
}

/**
 * Identifica e valida documento (CPF ou CNPJ).
 * Retorna { valido, tipo, digitos } — `digitos` é a versão normalizada
 * (só números) para gravar no banco.
 */
export function inspecionarDocumento(input: string): DocumentoInfo {
  const digitos = apenasDigitos(input);
  if (digitos.length === 11) {
    return { valido: validarCPF(digitos), tipo: 'PF', digitos };
  }
  if (digitos.length === 14) {
    return { valido: validarCNPJ(digitos), tipo: 'PJ', digitos };
  }
  return { valido: false, tipo: null, digitos };
}
