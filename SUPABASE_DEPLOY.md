# Painel administrativo com Supabase

O frontend público e o painel usam Supabase diretamente por HTTPS. Express não é necessário neste fluxo estático. Nunca coloque chaves secret ou service_role em variáveis VITE_.

1. No SQL Editor do Supabase, execute `supabase/setup.sql` para criar tabelas e políticas RLS. Somente membros explícitos de site_admins podem inserir ou atualizar o conteúdo; visitantes podem ler apenas o conteúdo público.
2. Execute `supabase/seed.sql` para importar o conteúdo atual do repositório, incluindo a imagem. A importação não substitui dados já existentes. Não armazene informações privadas em site_config: seu conteúdo é público.
3. Em Authentication → Users, crie o usuário administrador com e-mail e senha forte e confirme o e-mail pela ferramenta administrativa. Desative novos cadastros públicos nas configurações de autenticação se não forem necessários. Criar uma conta não concede permissão de edição.
4. Copie o UUID desse usuário e execute no SQL Editor, substituindo o exemplo:

   ```sql
   insert into public.site_admins (user_id)
   values ('UUID-DO-USUARIO') on conflict do nothing;
   ```

5. Na Hostinger, mantenha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY nas variáveis de build. Instale com `npm ci`, compile com `npm run build` e publique `dist`. As variáveis VITE_ são incorporadas ao build; mudanças exigem nova compilação. O navegador não usa a API Express antiga nem sua senha padrão.
6. Para o subdomínio PHP/HTML já criado, envie o CONTEÚDO do mesmo dist para public_html/admin, sem substituir o site principal. Preserve arquivos existentes antes de publicar. O subdomínio deve servir index.html na raiz e assets/ na mesma pasta. Ative SSL. Não é preciso executar Node.js nesse subdomínio.
7. Em admin.casatopstore.io, o login abre automaticamente. No domínio principal também é possível usar /admin, desde que a hospedagem reescreva essa rota para index.html. O site público não exibe botão administrativo.

## Validação após publicação

- Abra o site público e confira os textos e a imagem importados.
- No subdomínio, entre com o e-mail e a senha do usuário autorizado.
- Edite um texto, salve e confira em uma nova aba do site principal (recarregue a página).
- Fechar sem salvar descarta as alterações locais; upload de imagem só é persistido ao salvar. Imagens aceitas: PNG, JPEG, WebP, GIF até 2 MB.
- Saia e confira que não consegue editar. Um usuário autenticado sem registro em site_admins também não pode editar, mesmo chamando a API Supabase diretamente.
- Não reutilize o backend Express legado para publicar a administração: ele permanece no repositório por compatibilidade, mas não foi integrado ao Supabase e usa autenticação antiga.

As sessões são independentes por origem: login no subdomínio não autentica automaticamente o domínio principal. O conteúdo é compartilhado pelo banco, não por cookies. Backups e histórico de versões não estão implementados. A publicação em GitHub/Hostinger e a execução de SQL precisam ser feitas separadamente; preparar estes arquivos não realiza essas ações.
