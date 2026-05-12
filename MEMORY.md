# MEMORY - Projeto Indicações Imersão T4
*Última atualização: 2026-05-12 15:43*

## 📌 Contexto
Plataforma de indicações para a 4ª edição da Imersão (Emagrecimento). Compradores ganham links únicos para indicar amigos e ganhar prêmios.

## 🛠️ Arquitetura & Integrações
- **Frontend:** Astro + Tailwind (Mobile First).
- **Banco:** Supabase (`imersao_t4_profiles`, `imersao_t4_purchases`).
- **Tracking:** Parâmetro `sck` via Hotmart.
- **Webhook:** Edge Function `imersao-t4-webhook-hotmart` processa vendas aprovadas.

## 📝 Mudanças Recentes (2026-05-12)
- **Correção de Ranking:** Ranking agora busca dados reais do banco.
- **Novos Prêmios (Imersão T4):**
  - 1 Venda: Acesso à RESSACA (Encontro extra).
  - 3 Vendas: Ressaca + E-book "Me Formei em Nutrição".
  - 5 Vendas: Gravação da Imersão Completa.
  - 40 Vendas: Vaga na Formação Nutrição Avançada.
- **Login:** Adicionado campo de "Nome Completo" no formulário de ativação.
- **Copy:** Atualizada conforme briefing do usuário.

## 🚀 Próximos Passos
- Validar se o Webhook URL foi configurado no Hotmart Dashboard.
- Testar fluxo ponta a ponta com compra de teste.
