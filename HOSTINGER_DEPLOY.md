# Deploy na Hostinger

Este projeto está pronto para ser publicado como uma aplicação Node.js na Hostinger.

## Estrutura recomendada

- Domínio principal: landing pública
- Subdomínio admin: painel administrativo
- Backend: Node.js com Express, rodando em uma porta pública da Hostinger
- Frontend: build do Vite em `dist/`

## Passo a passo

1. Faça upload do projeto completo para a Hostinger, ou conecte com Git.
2. Na configuração da app da Hostinger, use:
   - comando de start: `npm install && npm run build && npm start`
   - ou, se a Hostinger permitir apenas `npm start`, deixe o script `start` do `package.json` como padrão.
3. A aplicação usa a variável `PORT` quando disponível.
4. O backend serve o build do front automaticamente quando a pasta `dist/` existe.

## Observações importantes

- O arquivo principal do servidor é `server/index.js`.
- O painel administrativo usa a senha: `casatopstore123`.
- Os dados do site ficam em `server/data/siteConfig.json`.
- Em produção real, o ideal é separar a área pública e a área admin em subdomínios diferentes.

## Comando local de validação

```bash
npm install
npm run build
npm start
```

## URLs esperadas

- site público: `https://seusite.com`
- painel admin: `https://admin.seusite.com`

Se a Hostinger não permitir Node.js no domínio principal, a alternativa recomendada é:

- publicar o site público em `static` ou `dist/`
- manter o painel admin em um subdomínio com Node.js
