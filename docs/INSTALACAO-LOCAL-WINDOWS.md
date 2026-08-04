# Configuração do PostgreSQL local no Windows

## Banco principal

A aplicação usa `DATABASE_URL` como conexão operacional. Na instalação do PDV, crie ou edite o arquivo `.env.local` na pasta do projeto:

```env
DATABASE_URL=postgresql://pdv_app:SUA_SENHA@127.0.0.1:5432/pdv_local
```

Substitua somente `SUA_SENHA` pela senha local do usuário `pdv_app`. Não coloque aspas e não compartilhe esse arquivo.

Se a senha contiver caracteres reservados de URL, como `@`, `:`, `/`, `?`, `#` ou `%`, eles precisam ser codificados no valor da URL. Outra opção é definir uma senha forte composta por letras e números para o usuário exclusivo da aplicação.

O arquivo `.env.local` é ignorado pelo Git e não deve ser enviado junto com backups ou código-fonte.

## Neon

O Neon não deve permanecer em `DATABASE_URL` na máquina do PDV. A conexão remota será configurada separadamente na etapa de sincronização, usando uma variável própria:

```env
NEON_BACKUP_DATABASE_URL=postgresql://USUARIO:SENHA@HOST/neondb?sslmode=require&channel_binding=require
```

Essa variável ainda não participa das operações do PDV. Até a fila de sincronização ser implementada e validada, mantenha a credencial do Neon guardada em local seguro.

## Validação

Depois de configurar a conexão e iniciar novamente a aplicação, abra no navegador:

```text
http://localhost:3000/api/test-db
```

O resultado esperado contém:

```json
{
  "success": true,
  "connection": {
    "mode": "local",
    "host": "127.0.0.1",
    "port": "5432",
    "database": "pdv_local"
  }
}
```

A resposta nunca deve exibir senha ou URL completa de conexão.

## Requisitos locais

- PostgreSQL 18 executando como serviço do Windows.
- Banco `pdv_local` restaurado e conferido.
- Usuário `pdv_app` como proprietário das tabelas.
- Node.js 24 LTS.
- Porta PostgreSQL restrita à máquina local.
