# RESTFul Boilerplate API in Node.js

## Libs

- WPP Connect
- ExpressJS
- Routing Controllers
- TypeORM
- Postgres
- Docker

## Rotas de autenticação de usuário basica

#### Gerar token de acesso

```http
  POST /auth/generate-access-token
```

| Parâmetro Header                 | Tipo     | Valor                                    | Descrição                                   |
| :------------------------------- | :------- | :--------------------------------------- | :------------------------------------------ |
| `f573853e8dfe5eb0e258afe5595deb` | `string` | daf4c4068e71e4d5e8c96d54a8db5711aaab6d95 | **Obrigatório**. Identificação de aplicação |

| Parâmetros Body | Tipo     | Descrição                                 |
| :-------------- | :------- | :---------------------------------------- |
| `username`      | `string` | **Obrigatório**. Identificação do usuário |
| `password`      | `string` | **Obrigatório**. Senha do usuário         |

##

#### Refresh token de acesso

```http
  POST /auth/refresh-access-token
```

| Parâmetro Header                 | Tipo     | Valor                                    | Descrição                                   |
| :------------------------------- | :------- | :--------------------------------------- | :------------------------------------------ |
| `f573853e8dfe5eb0e258afe5595deb` | `string` | daf4c4068e71e4d5e8c96d54a8db5711aaab6d95 | **Obrigatório**. Identificação de aplicação |

| Parâmetros Body | Tipo     | Descrição                                              |
| :-------------- | :------- | :----------------------------------------------------- |
| `username`      | `string` | **Obrigatório**. Identificação do usuário              |
| `password`      | `string` | **Obrigatório**. Senha do usuário                      |
| `refreshToken`  | `string` | **Obrigatório**. Refresh token criado na rota anterior |
