import { Like, MoreThanOrEqual, Not } from 'typeorm'
import { datasource } from '..'
import { AppDataSource } from '../data-source'
import moment from 'moment'
import { getFormattedCPFCNPJ } from '../utils/functions'
import { Client } from '../types/client'
import sha1 from 'sha1'

export class MKRep {
  static getConn = () => {
    if (!datasource) return AppDataSource

    return datasource
  }

  static execute = async (query: string) => {
    let result = null
    try {
      result = await MKRep.getConn().query(query)
    } catch (e) {
      result = null
    }
    return result
  }

  static async existColumn(tableName: string, columnName: string) {
    let result = false

    try {
      const response = await MKRep.execute(
        `SELECT ${columnName} FROM ${tableName}`
      )

      if (response) result = true
    } catch (e) {
      result = false
    }

    return result
  }

  static async createColumnInTable(tableName: string, columnName: string) {
    let result = false

    try {
      const queryString = `ALTER TABLE ${tableName} ADD last_trust_unlock_date DATETIME DEFAULT '${moment().format(
        'YYYY-MM-DD HH:mm:ss'
      )}';`

      const response = await MKRep.execute(queryString)
      if (response) result = true
    } catch (e) {
      result = false
    }

    return result
  }

  static async getPlanByName(planName: string) {
    let plan = null

    try {
      const query = `SELECT nome, valor, velup AS upload, veldown AS download, REPLACE(REPLACE(descricao, '\r', ''), '\n', '\n') AS descricao, desc_titulo FROM sis_plano WHERE nome = '${planName}' ORDER BY valor ASC;`

      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const p = results[i]
          if (p) {
            plan = {
              id: sha1(p.nome),
              name: p.nome,
              title: p.desc_titulo,
              description: p.descricao,
              value: p.valor,
              upload: p.upload,
              download: p.download
            }
          }
        }
      }
    } catch (e) {
      plan = null
    }

    return plan
  }

  static async getQRPixFromBillUUID(uuidLanc: string) {
    let qrCode = null

    try {
      const query = `SELECT qrcode FROM sis_qrpix WHERE titulo = '${uuidLanc}';`

      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const p = results[i]
          if (p) {
            qrCode = p.qrcode
          }
        }
      }
    } catch (e) {
      qrCode = null
    }

    return qrCode
  }

  static async getChamadosByClientLogin(login: string) {
    let oss: Array<any> = []

    try {
      const query = `SELECT chamado, nome, email, assunto, atendente, login_atend, abertura, visita FROM sis_suporte WHERE login = '${login}' AND login_atend = 'botfy_login' AND status = 'aberto';`

      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const os = results[i]
          if (os) {
            oss.push({
              chamado: os.chamado,
              nome: os.nome,
              email: os.email,
              assunto: os.assunto,
              atendente: os.atendente,
              login_atend: os.login_atend,
              abertura: os.abertura,
              visita: os.visita
            })
          }
        }
      }
    } catch (e) {
      oss = []
    }

    return oss
  }

  static async getClientBillsByLogin(login: string) {
    let bills: Array<any> = []

    try {
      const query = `SELECT id, uuid_lanc, datavenc, status, valor, tipocob, codigo_carne, linhadig FROM sis_lanc WHERE login = '${login}' AND (status = 'vencido' OR status = 'aberto') AND deltitulo = 0;`

      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const bill = results[i]
          if (bill) {
            bills.push({
              id: bill.id,
              uuid: bill.uuid_lanc,
              due_date: bill.datavenc,
              status: bill.status,
              value: bill.valor,
              tipocob: bill.tipocob,
              codigo_carne: bill.codigo_carne,
              linhadig: bill.linhadig
            })
          }
        }
      }
    } catch (e) {
      bills = []
    }

    const hasQRPixTable = await MKRep.existColumn('sis_qrpix', 'titulo')
    if (bills.length >= 1 && hasQRPixTable) {
      for (let i = 0; i < bills.length; i++) {
        const bill = bills[i]
        if (bill && bill.uuid) {
          const pixContent = await MKRep.getQRPixFromBillUUID(bill.uuid)
          if (pixContent) bill.qrCode = pixContent
        }
      }
    }

    return bills
  }

  static async getClientByCPFCNPJ(cpfCnpj: string) {
    let clients: Array<Client> = []

    const existColumn = await MKRep.existColumn(
      'sis_cliente',
      'last_trust_unlock_date'
    )

    if (!existColumn) {
      await MKRep.createColumnInTable('sis_cliente', 'last_trust_unlock_date')
    }

    const query = `SELECT (SELECT utilizar FROM sis_boleto WHERE id = CLI.conta) AS contaIntegration, (SELECT MAX(C.radacctid) AS conectado FROM radacct C WHERE C.acctstoptime IS NULL AND C.username = CLI.login LIMIT 1) as connected, CLI.id, CLI.conta, CLI.nome, CLI.cadastro, CLI.login, CLI.senha, CLI.email, CLI.venc AS vencimento, CLI.observacao, CLI.rem_obs, CLI.last_trust_unlock_date, CLI.bloqueado, CLI.uuid_cliente, NOW() AS dataHora, CLI.plano, CLI.status_corte FROM sis_cliente AS CLI WHERE (cpf_cnpj = '${cpfCnpj}' OR cpf_cnpj = '${getFormattedCPFCNPJ(
      cpfCnpj
    )}') AND cli_ativado = 's';`

    const results = await MKRep.execute(query)
    if (Array.isArray(results)) {
      for (let i = 0; i < results.length; i++) {
        const cli = results[i] as Client
        if (cli) {
          cli.isConnected = cli.connected !== null
          cli.observacao = cli.observacao === 'sim'
          cli.bloqueado = cli.bloqueado === 'sim'
          cli.plano = await MKRep.getPlanByName(cli.plano)
          cli.oss = await MKRep.getChamadosByClientLogin(cli.login)
          cli.bills = await MKRep.getClientBillsByLogin(cli.login)
          clients.push(cli)
        }
      }
    }

    // let attendants = await MKRep.getConn().query(``)
    return clients
  }
}
