export type Client = {
  contaIntegration: any
  connected: any
  isConnected: boolean
  id: string
  conta: string
  name: string
  nome: string
  cadastro: string
  login: string
  password: string
  email: string
  vencimento: string
  observacao: any
  rem_obs: string
  last_trust_unlock_date: string
  bloqueado: any
  uuid_cliente: string
  dataHora: string
  plano: any
  status_corte: string
  oss: Array<any>
  bills: Array<any>

  endereco: string
  bairro: string
  cidade: string
  estado: string
  numero: string
  complemento: string
  cep: string

  endereco_res: string
  bairro_res: string
  cidade_res: string
  estado_res: string
  numero_res: string
  cep_res: string
  complemento_res: string
}
