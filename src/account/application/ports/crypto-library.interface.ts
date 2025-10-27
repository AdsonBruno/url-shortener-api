/**
 * Abstração para bibliotecas de criptografia/hash
 * Permite inversão de dependência, desacoplando do bcrypt
 */
export interface ICryptoLibrary {
  /**
   * Gera hash de uma string com salt
   * @param data - String a ser hasheada
   * @param saltRounds - Número de rounds do salt
   */
  hash(data: string, saltRounds: number): Promise<string>;

  /**
   * Compara uma string com um hash
   * @param data - String original
   * @param hashedData - Hash para comparação
   */
  compare(data: string, hashedData: string): Promise<boolean>;
}
