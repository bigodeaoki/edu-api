import { registerDecorator, ValidationOptions } from 'class-validator';
import { inspecionarDocumento } from '../documento';

/**
 * Valida CPF (11 dígitos) ou CNPJ (14 dígitos) com dígitos verificadores.
 * Aceita string com ou sem máscara — só conta os dígitos.
 */
export function IsDocumento(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDocumento',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          return inspecionarDocumento(value).valido;
        },
        defaultMessage(): string {
          return 'Documento inválido (use CPF de 11 dígitos ou CNPJ de 14 dígitos)';
        },
      },
    });
  };
}
