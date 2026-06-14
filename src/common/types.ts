export type Role = 'owner' | 'user';
export type Parte = 'A' | 'B';
export type ParcelaStatus = 'pendente' | 'pago' | 'vencido';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
