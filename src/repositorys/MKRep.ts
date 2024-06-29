import { datasource } from '..'
import { AppDataSource } from '../data-source'
import moment from 'moment'
import { getFormattedCPFCNPJ } from '../utils/functions'
import { Client } from '../types/client'
import sha1 from 'sha1'
import sha256 from 'sha256'

export class MKRep {
  static botfy_name = 'Botfy Bot Atendente'
  static botfy_email = 'atendente@botfy.com'
  static botfy_login = 'botfy_login'
  static botfy_password = sha256('diTzCA$@35&0')

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
      const date = moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
      const queryString = `ALTER TABLE ${tableName} ADD last_trust_unlock_date DATETIME DEFAULT '${date}';`

      const response = await MKRep.execute(queryString)
      if (response) result = true
    } catch (e) {
      console.log(e)
      result = false
    }

    return result
  }

  static async getBotfyAttendant() {
    let attendant = null

    try {
      const query = `SELECT idacesso, nome, email, login, sha FROM sis_acesso WHERE login = 'botfy_login';`

      const results = await MKRep.getConn().query(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const p = results[i]
          if (p) {
            if (
              p.sha !==
              'b34a1300a90d7d17b7cbb2d72a4aca4c1d6f1139c0eba0040a352a97fd0aee94'
            ) {
              const queryUpdate = `UPDATE sis_acesso SET sha = '${MKRep.botfy_password}', email = '${MKRep.botfy_email}', nome = '${MKRep.botfy_name}' WHERE login = '${MKRep.botfy_login}';`
              await MKRep.getConn().query(queryUpdate)
            }

            attendant = {
              id: Number(p.idacesso),
              name: p.nome,
              email: p.email,
              login: p.login
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
      attendant = null
    }

    return attendant
  }

  static async handleCreateBotfyAttendant() {
    let created: any = false

    const query = `INSERT INTO sis_acesso (login, sha, email, nivel, nome) values ('${MKRep.botfy_login}', '${MKRep.botfy_password}', '${MKRep.botfy_email}', '', '${MKRep.botfy_name}');`
    try {
      const results = await MKRep.getConn().query(query)

      if (results.affectedRows) {
        created = true
      }
    } catch (e) {
      console.log(e)
      created = false
    }

    return created
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
      console.log(e)
      plan = null
    }

    return plan
  }

  static async getAllPlans() {
    let plans = []

    try {
      const query = `SELECT nome, valor, velup AS upload, veldown AS download, REPLACE(REPLACE(descricao, '\r', ''), '\n', '\n') AS descricao, desc_titulo FROM sis_plano WHERE oculto = 'nao' ORDER BY valor ASC;`

      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const p = results[i]
          if (p) {
            plans.push({
              id: sha1(p.nome),
              name: p.nome,
              title: p.desc_titulo,
              description: p.descricao,
              value: p.valor,
              upload: p.upload,
              download: p.download
            })
          }
        }
      }
    } catch (e) {
      console.log(e)
      plans = []
    }

    return plans
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
      console.log(e)
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
      console.log(e)
      oss = []
    }

    return oss
  }

  static async getClientBillsByLogin(login: string) {
    let bills: Array<any> = []

    try {
      const query = `SELECT id, uuid_lanc, datavenc, status, valor, tipocob, codigo_carne, linhadig FROM sis_lanc WHERE login = '${login}' AND (status = 'vencido' OR status = 'aberto') AND deltitulo = 0 ORDER BY datavenc ASC;`

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
      console.log(e)
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
    const attendant = await MKRep.getBotfyAttendant()
    if (!attendant) {
      await MKRep.handleCreateBotfyAttendant()
    }

    let clients: Array<Client> = []

    const existColumn = await MKRep.existColumn(
      'sis_cliente',
      'last_trust_unlock_date'
    )

    if (!existColumn) {
      await MKRep.createColumnInTable('sis_cliente', 'last_trust_unlock_date')
    }

    const query = `SELECT (SELECT utilizar FROM sis_boleto WHERE id = CLI.conta) AS contaIntegration, (SELECT MAX(C.radacctid) AS conectado FROM radacct C WHERE C.acctstoptime IS NULL AND C.username = CLI.login LIMIT 1) as connected, CLI.id, CLI.conta, CLI.nome, CLI.cadastro, CLI.login, CLI.senha, CLI.email, CLI.venc AS vencimento, CLI.observacao, CLI.rem_obs, CLI.last_trust_unlock_date, CLI.bloqueado, CLI.uuid_cliente, NOW() AS dataHora, CLI.plano, CLI.status_corte, CLI.endereco, CLI.endereco_res, CLI.bairro, CLI.bairro_res, CLI.cidade, CLI.cidade_res, CLI.numero, CLI.numero_res, CLI.cep, CLI.cep_res, CLI.estado, CLI.estado_res, CLI.complemento, CLI.complemento_res FROM sis_cliente AS CLI WHERE (cpf_cnpj = '${cpfCnpj}' OR cpf_cnpj = '${getFormattedCPFCNPJ(
      cpfCnpj
    )}') AND cli_ativado = 's';`

    try {
      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const cli = results[i] as Client
          if (cli) {
            cli.isConnected = cli.connected !== null
            cli.observacao = cli.observacao === 'sim'
            cli.bloqueado = cli.bloqueado === 'sim'
            cli.name = cli.nome
            cli.plano = await MKRep.getPlanByName(cli.plano)
            cli.oss = await MKRep.getChamadosByClientLogin(cli.login)
            cli.bills = await MKRep.getClientBillsByLogin(cli.login)
            cli.cep = cli.cep || cli.cep_res
            cli.bairro = cli.bairro || cli.bairro_res
            cli.endereco = cli.endereco || cli.endereco_res
            cli.cidade = cli.cidade || cli.cidade_res
            cli.estado = cli.estado || cli.estado_res
            cli.numero = cli.numero || cli.numero_res
            cli.complemento = cli.complemento || cli.complemento_res
            clients.push(cli)
          }
        }
      }
    } catch (e) {
      console.log(e)
      clients = []
    }

    return clients
  }

  static async getClientBillById(billId: string) {
    let billRet: any = null

    try {
      const query = `SELECT id, uuid_lanc, datavenc, status, valor, tipocob, codigo_carne, linhadig FROM sis_lanc WHERE id = '${billId}' AND (status = 'vencido' OR status = 'aberto') AND deltitulo = 0;`

      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const bill = results[i]
          if (bill) {
            billRet = {
              id: bill.id,
              uuid: bill.uuid_lanc,
              due_date: bill.datavenc,
              status: bill.status,
              value: bill.valor,
              tipocob: bill.tipocob,
              codigo_carne: bill.codigo_carne,
              linhadig: bill.linhadig
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
      billRet = null
    }

    const hasQRPixTable = await MKRep.existColumn('sis_qrpix', 'titulo')
    if (billRet && hasQRPixTable) {
      if (billRet && billRet.uuid) {
        const pixContent = await MKRep.getQRPixFromBillUUID(billRet.uuid)
        if (pixContent) billRet.qrCode = pixContent
      }
    }

    return billRet
  }

  static async getInstalacoesByClientCPF(cpfCnpj: string) {
    let installations: Array<any> = []

    const existUUID = await MKRep.existColumn('sis_solic', 'uuid_solic')
    let query = `SELECT id, nome, email, cpf, numero_res, endereco_res AS rua, bairro_res as bairro, complemento_res as complemento, cep_res as cep, cidade_res as cidade, estado_res, plano, obs, visita FROM sis_solic WHERE (cpf = '${cpfCnpj}' OR cpf = '${getFormattedCPFCNPJ(
      cpfCnpj
    )}') AND status = 'aberto';`

    if (existUUID)
      query = `SELECT id, uuid_solic, nome, email, cpf, numero_res, endereco_res AS rua, bairro_res as bairro, complemento_res as complemento, cep_res as cep, cidade_res as cidade, estado_res, plano, obs, visita FROM sis_solic WHERE (cpf = '${cpfCnpj}' OR cpf = '${getFormattedCPFCNPJ(
        cpfCnpj
      )}') AND status = 'aberto';`

    try {
      const results = await MKRep.execute(query)
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const install = results[i]
          if (install) {
            installations.push({
              id: install.id || install.uuid_solic,
              nome: install.nome,
              email: install.email,
              cpf: install.cpf,
              numero_res: install.numero_res,
              rua: install.rua,
              bairro: install.bairro,
              complemento: install.complemento,
              cep: install.cep,
              cidade: install.cidade,
              estado_res: install.estado_res,
              plano: install.plano,
              obs: install.obs,
              visita: install.visita
            })
          }
        }
      }
    } catch (e) {
      console.log(e)
      installations = []
    }

    return installations
  }

  static async handleCreateInstallation(
    uuid_solic: string,
    phoneNumber: string,
    nome: string,
    email: string,
    cpfCnpj: string,
    numeroRes: string,
    rua: string,
    bairro: string,
    complemento: string,
    cep: string,
    cidade: string,
    estado: string,
    planName: string,
    obs: string,
    loginAttendant: string,
    daysToSendTecSupport: number,
    dataSolic: string,
    login: string,
    senha: string
  ) {
    const attendant = await MKRep.getBotfyAttendant()
    if (!attendant) {
      await MKRep.handleCreateBotfyAttendant()
    }

    let created: any = false

    let query = `INSERT INTO sis_solic (uuid_solic, endereco, bairro, cidade, estado, cep, complemento, telefone, celular, nome, email, cpf, login, senha, datainst, numero_res, endereco_res, bairro_res, complemento_res, cep_res, cidade_res, estado_res, plano, obs, visita, login_atend, tipo, contrato) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() + INTERVAL ? DAY, ?, 'instalacao', 1);`

    try {
      const results = await MKRep.getConn().query(query, [
        uuid_solic,
        rua,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        phoneNumber,
        phoneNumber,
        nome,
        email,
        cpfCnpj,
        login,
        senha,
        dataSolic,
        numeroRes,
        rua,
        bairro,
        complemento,
        cep,
        cidade,
        estado,
        planName,
        obs,
        daysToSendTecSupport,
        loginAttendant
      ])

      if (results.affectedRows) {
        created = true
      }
    } catch (e) {
      console.log(e)
      created = false
    }

    return created
  }

  static async handleCreateOS(
    chamado: string,
    nome: string,
    login: string,
    email: string,
    assunto: string,
    atendente: string,
    login_atend: string,
    daysToSendTecSupport: number
  ) {
    const attendant = await MKRep.getBotfyAttendant()
    if (!attendant) {
      await MKRep.handleCreateBotfyAttendant()
    }

    let created: any = false

    let query = `INSERT INTO sis_suporte (chamado, nome, login, email, assunto, atendente, login_atend, abertura, visita) values (?, ?, ?, ?, ?, ?, ?, NOW(), NOW() + INTERVAL ? DAY);`

    try {
      const results = await MKRep.getConn().query(query, [
        chamado,
        nome,
        login,
        email,
        assunto,
        atendente,
        login_atend,
        daysToSendTecSupport
      ])

      if (results.affectedRows) {
        created = true
      }
    } catch (e) {
      console.log(e)
      created = false
    }

    return created
  }

  static async createLog(login: string, date: string, message: string) {
    const attendant = await MKRep.getBotfyAttendant()
    if (!attendant) {
      await MKRep.handleCreateBotfyAttendant()
    }

    let created: any = false

    let query = `INSERT INTO sis_logs (operacao, tipo, login, data, registro) values ('822E6F34', 'admin', ?, ?, ?);`

    try {
      const results = await MKRep.getConn().query(query, [login, date, message])

      if (results.affectedRows) {
        created = true
      }
    } catch (e) {
      console.log(e)
      created = false
    }

    return created
  }

  static async createMessageInOS(
    osId: string,
    login: string,
    name: string,
    message: string,
    date: string
  ) {
    const attendant = await MKRep.getBotfyAttendant()
    if (!attendant) {
      await MKRep.handleCreateBotfyAttendant()
    }

    let created: any = false

    let query = `INSERT INTO sis_msg (tipo, chamado, login, atendente, msg, msg_data) values ('F5F5F5', ?, ?, ?, ?, ?);`

    try {
      const results = await MKRep.getConn().query(query, [
        osId,
        login,
        name,
        message,
        date
      ])

      if (results.affectedRows) {
        created = true
      }
    } catch (e) {
      console.log(e)
      created = false
    }

    return created
  }

  static async handleUnlockClientByCPF(
    login: string,
    daysToGiveUnlock: number
  ) {
    let created: any = false

    let query = `UPDATE sis_cliente SET observacao = 'sim', rem_obs = NOW() + INTERVAL ? DAY, last_trust_unlock_date = NOW() + INTERVAL ? DAY, bloqueado = 'nao', data_bloq = NULL, data_desbloq = NOW() WHERE login = ?;`

    try {
      const results = await MKRep.getConn().query(query, [
        daysToGiveUnlock,
        daysToGiveUnlock,
        login
      ])

      if (results.affectedRows) {
        created = true
      }
    } catch (e) {
      console.log(e)
      created = false
    }

    return created
  }

  static async populateTelefoneWithCelular() {
    let result = {
      updated: false,
      updatedRows: 0
    }

    let query = `UPDATE sis_cliente SET telefone = celular WHERE telefone IS NULL;`

    try {
      const results = await MKRep.getConn().query(query)

      if (results.affectedRows) {
        result.updated = true
        result.updatedRows = results.affectedRows
      }
    } catch (e) {
      console.log(e)
      result.updated = false
    }

    return result
  }

  static async getClientesCountWithTelefoneIsNull() {
    let count = 0

    let query = `SELECT COUNT(*) AS total FROM sis_cliente WHERE telefone IS NULL;`

    try {
      const results = await MKRep.getConn().query(query)

      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          const p = results[i]
          if (p) {
            count = p.total
          }
        }
      }
    } catch (e) {
      console.log(e)
      count = 0
    }

    return count
  }
}
