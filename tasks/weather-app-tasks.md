# Backlog de Tarefas — Weather App

Fonte: [plano técnico](../plans/weather-app-plan.md), subordinado à [especificação](../specs/weather-app-spec.md).

**Gate de início:** a spec está em rascunho. Resolver as decisões bloqueadoras OQ-03 a OQ-11 e confirmar OQ-01 antes de congelar a implementação correspondente. OQ-02 foi parcialmente resolvida por D-06/D-07; reabri-la somente para adicionar indicadores além do escopo atual. OQ-12 precisa ser decidida antes de analytics ou logs persistentes. T-01 alinha contratos divergentes. Propostas não aprovadas não são requisitos.

As entregas seguem a ordem solicitada: tipos → funções puras → services → hook → componentes → integração → testes → hardening. Dentro da entrega de componentes, T-11 a T-16 dependem explicitamente da base visual T-10. Dependências sempre apontam para tarefas anteriores; implementação e testes têm tarefas separadas.

## Rastreabilidade dos requisitos funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de verificação |
| --- | --- | --- |
| RF-01 — Buscar cidades por nome e informar quando não houver correspondências. | T-07 geocoding; T-09 hook; T-11 busca/seleção; T-15 estado vazio; T-17 integração. | T-22 geocoding; T-24 hook; T-25 busca; T-28 estados; T-29 composição; T-30 E2E busca. |
| RF-02 — Exibir clima atual da cidade selecionada. | T-04 formatação; T-06 códigos WMO; T-08 forecast; T-12 visualização; T-17 integração. | T-19 formatação; T-21 códigos WMO; T-23 forecast; T-26 visualização; T-29 composição; T-31 E2E forecast. |
| RF-03 — Exibir cinco dias, começando hoje. | T-05 cálculo de datas; T-06 códigos WMO; T-08 forecast; T-12 visualização; T-17 integração. | T-20 datas; T-21 códigos WMO; T-23 forecast; T-26 visualização; T-29 composição; T-31 E2E forecast. |
| RF-04 — Alternar temperaturas entre Celsius e Fahrenheit. | T-03 conversão; T-04 formatação; T-09 hook; T-13 seletor de unidade; T-17 integração. | T-18 conversão; T-19 formatação; T-24 hook; T-27 seletor; T-29 composição; T-31 E2E forecast/unidade. |
| RF-05 — Informar estados inicial, carregamento, vazio e erro, com recuperação. | T-07/T-08 services; T-09 hook; T-11 busca; T-14 loading; T-15 vazio; T-16 erro; T-17 integração. | T-22/T-23 services; T-24 hook; T-25 busca; T-28 estados; T-29 composição; T-32 E2E falhas. |
| RF-06 — Permitir seleção explícita entre cidades homônimas. | T-07 geocoding; T-09 hook; T-11 busca/seleção; T-17 integração. | T-22 geocoding; T-24 hook; T-25 busca; T-29 composição; T-30 E2E busca. |
| RF-07 — Identificar fonte e referência temporal dos dados. | T-04 formatação; T-05 datas; T-08 forecast; T-12 visualização; T-17 integração. | T-19 formatação; T-20 datas; T-23 forecast; T-26 visualização; T-29 composição; T-31 E2E forecast. |

**Lacunas:** nenhuma. RF-01 a RF-07 têm tarefas de implementação e tarefas de verificação associadas; decisões de produto ainda abertas permanecem sujeitas ao gate acima.

## Prioridade e tamanho

Prioridade: **P0** bloqueia a primeira entrega funcional; **P1** completa resiliência ou critérios de qualidade antes da liberação; **P2** seria melhoria opcional fora dos requisitos atuais. Tamanho relativo: **P** pequeno e localizado; **M** envolve mais cenários ou integração; **G** concentra coordenação/risco elevado. São estimativas relativas, não prazos.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | M |
| T-06 | P0 | P |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | G |
| T-10 | P0 | P |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | P |
| T-14 | P0 | P |
| T-15 | P0 | P |
| T-16 | P0 | P |
| T-17 | P0 | M |
| T-18 | P0 | P |
| T-19 | P1 | P |
| T-20 | P0 | P |
| T-21 | P1 | P |
| T-22 | P0 | M |
| T-23 | P0 | M |
| T-24 | P0 | M |
| T-25 | P0 | P |
| T-26 | P0 | P |
| T-27 | P0 | P |
| T-28 | P0 | P |
| T-29 | P0 | M |
| T-30 | P0 | M |
| T-31 | P0 | M |
| T-32 | P1 | M |
| T-33 | P1 | M |
| T-34 | P1 | M |
| T-35 | P1 | M |
| T-36 | P1 | M |
| T-37 | P1 | P |

**P2:** nenhuma tarefa atual. Não há itens opcionais no escopo aprovado; melhorias fora da spec devem entrar apenas após nova decisão de produto.

## Entrega 1 — Contratos e tipos

### T-01 — Consolidar contratos técnicos
- **Descrição:** alinhar nomes e campos do modelo no plano e na spec.
- **Requisitos relacionados:** RF-02 (AC-05), RF-03 (AC-06, AC-08), RF-07 (AC-20, AC-21); RNF-05.
- **Critérios de aceite:** usar um único nome (`ForecastDay` ou `DailyForecast`) no contrato e mapeamento; declarar `timezone` em um único local coerente; definir nulabilidade de cada campo externo ausente; manter OQs não resolvidas como gates explícitos.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `plans/weather-app-plan.md`, `specs/weather-app-spec.md`.
- **Tipo:** Infra.

### T-02 — Declarar tipos de domínio
- **Descrição:** definir os contratos TypeScript aprovados para cidade, clima, previsão, unidade, estado e erro.
- **Requisitos relacionados:** RF-01 a RF-07; RNF-05.
- **Critérios de aceite:** tipos refletem nulabilidade documentada em T-01; temperaturas internas usam Celsius; unidade admite somente `celsius | fahrenheit`; estados incluem idle/loading/success/empty/error/selectingCity; typecheck strict dos tipos passa com `pnpm exec tsc --ignoreConfig --noEmit --strict --target ES2022 --moduleResolution bundler --module ESNext --skipLibCheck src/types/weather.ts`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

## Entrega 2 — Funções puras

### T-03 — Implementar conversão de temperatura
- **Descrição:** criar conversão pura entre Celsius e Fahrenheit.
- **Requisitos relacionados:** RF-04 (AC-10 a AC-12); RNF-05.
- **Critérios de aceite:** conversão matemática sem arredondamento retorna 0 °C → 32 °F, 20 °C → 68 °F, −10 °C → 14 °F, 20,4 °C → 68,72 °F e −10,5 °C → 13,1 °F (comparação de ponto flutuante com tolerância); conversão inversa retorna 32 °F → 0 °C e 68 °F → 20 °C; função não muta entrada nem faz request. Arredondamento visual pertence a T-04 e aguarda OQ-06.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.

### T-04 — Implementar formatação pt-BR
- **Descrição:** criar funções puras de formatação de valores e datas.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05), RF-03 (AC-06), RF-04 (AC-09, AC-12), RF-07 (AC-20); RNF-08.
- **Critérios de aceite:** após aprovação de A-05/OQ-05, datas seguem `DD/MM/AAAA` e números usam locale `pt-BR`; temperaturas incluem `°C` ou `°F` e arredondamento segue A-06/OQ-06; temperatura nula retorna `null` (a UI escolhe o texto de indisponibilidade), nunca zero, `NaN` ou `undefined`; funções não mutam entrada. Enquanto OQ-05/OQ-06 estiver pendente, a formatação correspondente fica bloqueada.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.

### T-05 — Implementar cálculo de datas
- **Descrição:** calcular a janela de cinco dias no fuso aprovado da cidade.
- **Requisitos relacionados:** RF-03 (AC-06, AC-08), RF-07 (AC-20); RNF-05.
- **Critérios de aceite:** com relógio fixo em 29/10/2026 às 23:30 no fuso da cidade, retorna 29/10, 30/10, 31/10, 01/11 e 02/11; datas são únicas e não dependem do fuso do dispositivo.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/date.ts`.
- **Tipo:** Data.

### T-06 — Implementar mapeamento WMO
- **Descrição:** mapear códigos meteorológicos para descrições em pt-BR.
- **Requisitos relacionados:** RF-02 (AC-04), RF-03 (AC-07); RNF-08.
- **Critérios de aceite:** cada código incluído no mapa retorna sua descrição pt-BR; código desconhecido retorna exatamente `Condição indisponível`, sem lançar erro.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.

## Entrega 3 — Services

### T-07 — Implementar serviço de geocoding
- **Descrição:** consultar cidades e normalizar resultados para `City`.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-06 (AC-18, AC-19); RNF-04, RNF-07, RNF-08.
- **Critérios de aceite:** após OQ-04/OQ-05, a query usa exatamente os parâmetros de geocoding aprovados e codifica o nome; resposta válida mapeia nome e coordenadas e preserva região/país quando presentes; `results: []` retorna vazio; JSON inválido, coordenadas não finitas/fora dos limites, falha de rede ou HTTP retornam erro tipado; homônimos continuam sendo resultados distintos. Enquanto OQ-04/OQ-05 estiver pendente, a tarefa fica bloqueada.
- **Dependências:** T-02, T-03, T-04, T-05, T-06.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data.

### T-08 — Implementar serviço de forecast
- **Descrição:** buscar clima atual e cinco dias e normalizar a resposta.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05), RF-03 (AC-06 a AC-08), RF-07 (AC-20, AC-21); RNF-04, RNF-05, RNF-07, RNF-08.
- **Critérios de aceite:** após OQ-03, a request envia `current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code` e `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`, mais coordenadas, cinco dias e unidades especificadas no plano; mapeia cada campo para `CurrentWeather`/`ForecastDay`; probabilidades são percentuais; ausências ficam nulas; timezone/schema/arrays inválidas retornam `invalidResponse`. O contrato diário é D-07.
- **Dependências:** T-02, T-05, T-06, T-07.
- **Arquivos prováveis:** `src/services/forecastService.ts`.
- **Tipo:** Data.

## Entrega 4 — Hook

### T-09 — Implementar hook de clima
- **Descrição:** orquestrar busca, seleção, consulta, retry e estados.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-04 (AC-09 a AC-11), RF-05 (AC-13 a AC-17), RF-06 (AC-18, AC-19); RNF-04, RNF-05.
- **Critérios de aceite:** estados e transições idle/loading/selectingCity/success/empty/error são observáveis; zero resultados vai a empty, falha vai a error, homônimos aguardam seleção; retry repete operação; resposta obsoleta não altera estado; trocar unidade não invoca forecast.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.

## Entrega 5 — Componentes

### T-10 — Aplicar tema global
- **Descrição:** configurar estilos globais e tema dark glassmorphism do projeto.
- **Requisitos relacionados:** RNF-01, RNF-02, RNF-08.
- **Critérios de aceite:** entrypoint carrega CSS; existem tokens separados para fundo escuro, superfície translúcida, texto e borda; viewport de 320 px não tem rolagem horizontal; contraste é verificado em T-34.
- **Dependências:** T-02, T-09.
- **Arquivos prováveis:** `src/styles/index.css`.
- **Tipo:** UI.

### T-11 — Criar busca e seleção de cidades
- **Descrição:** implementar formulário e apresentação/seleção de resultados.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-05 (AC-13, AC-14), RF-06 (AC-18, AC-19); RNF-01, RNF-02, RNF-08.
- **Critérios de aceite:** input vazio não submete; submit emite uma query; homônimos exibem região/país disponíveis e exigem seleção explícita; controles têm nome acessível e operam por teclado.
- **Dependências:** T-02, T-09, T-10.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI.

### T-12 — Criar visualização meteorológica
- **Descrição:** implementar apresentação do clima atual e da previsão diária.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05, D-06), RF-03 (AC-06 a AC-08, D-07), RF-07 (AC-20, AC-21); RNF-01, RNF-02, RNF-05, RNF-08.
- **Critérios de aceite:** hero exibe temperatura atual grande, ícone e condição via `weatherCodes`; temperatura usa `lib/temperature` para `unit`; apresenta umidade (%), vento (km/h), precipitação (mm) e pressão (hPa). `ForecastList` usa rótulo de dia via `lib/format`, grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, máximas/mínimas na unidade atual e probabilidade diária com `%`; valores nulos exibem `—`; rótulos têm nomes acessíveis.
- **Dependências:** T-02, T-04, T-05, T-06, T-08, T-09, T-10.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`.
- **Tipo:** UI.

### T-13 — Criar seletor de unidade
- **Descrição:** implementar controle de Celsius/Fahrenheit.
- **Requisitos relacionados:** RF-04 (AC-09 a AC-11); RNF-01, RNF-02, RNF-08.
- **Critérios de aceite:** inicia em Celsius; expõe unidade atual por nome/estado acessível; emitir seleção não chama forecast.
- **Dependências:** T-02, T-03, T-09, T-10.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.

### T-14 — Criar estado de carregamento
- **Descrição:** apresentar consulta pendente de forma acessível.
- **Requisitos relacionados:** RF-05 (AC-14); RNF-02, RNF-08.
- **Critérios de aceite:** enquanto request está pendente, indicador com role/status e texto pt-BR está visível; ao concluir a operação, deixa de ser apresentado.
- **Dependências:** T-02, T-09, T-10.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI.

### T-15 — Criar estado vazio
- **Descrição:** apresentar orientação inicial e ausência de resultados.
- **Requisitos relacionados:** RF-01 (AC-03), RF-05 (AC-13, AC-14); RNF-02, RNF-08.
- **Critérios de aceite:** idle orienta a iniciar busca; zero resultados informa ausência de cidade, não falha de rede, e mantém ação para nova busca; mensagens são acessíveis e em pt-BR.
- **Dependências:** T-02, T-09, T-10, T-11.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.

### T-16 — Criar estado de erro
- **Descrição:** apresentar mensagem segura e ação de retry.
- **Requisitos relacionados:** RF-05 (AC-15 a AC-17); RNF-02, RNF-04, RNF-07, RNF-08.
- **Critérios de aceite:** mensagem pt-BR não contém stack trace, payload ou segredo; ação tem nome acessível; retry invoca uma vez o callback da operação falha.
- **Dependências:** T-02, T-09, T-10.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

## Entrega 6 — Integração

### T-17 — Compor a tela principal
- **Descrição:** conectar hook e componentes na aplicação e entrypoint.
- **Requisitos relacionados:** RF-01 a RF-07 (AC-01 a AC-21); RNF-01, RNF-02, RNF-04, RNF-05, RNF-07, RNF-08.
- **Critérios de aceite:** estado `idle` renderiza busca/orientação; `loading` renderiza LoadingState; `empty` renderiza EmptyState; `error` renderiza ErrorState com retry; `selectingCity` renderiza resultados selecionáveis; `success` renderiza cidade, clima atual, previsão, fonte e unidade; `App.tsx` não importa services; `pnpm dev` mostra um landmark `main` e o controle de busca.
- **Dependências:** T-09 a T-16.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Tipo:** UI.

## Entrega 7 — Testes

### T-18 — Testar conversão de temperatura
- **Descrição:** verificar conversões e limites numéricos.
- **Requisitos relacionados:** RF-04 (AC-10 a AC-12); RNF-05.
- **Critérios de aceite:** Vitest verifica resultados matemáticos 0 °C → 32 °F, 20 °C → 68 °F, −10 °C → 14 °F, 20,4 °C → 68,72 °F e −10,5 °C → 13,1 °F usando tolerância para floats; conversão inversa verifica 32 °F → 0 °C e 68 °F → 20 °C; a função não arredonda nem muta; suíte passa. Arredondamento e zero negativo são testados em T-19 após OQ-06.
- **Dependências:** T-03, T-17.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.

### T-19 — Testar formatação pt-BR
- **Descrição:** verificar unidades, números, datas e valores indisponíveis.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05), RF-03 (AC-06), RF-04 (AC-09, AC-12), RF-07 (AC-20); RNF-08.
- **Critérios de aceite:** após A-05/OQ-05/OQ-06, Vitest espera data `29/10/2026`, temperaturas arredondadas `20 °C` e `69 °F`, e `null` retornado sem string numérica; também verifica que nenhum caso produz zero substituto, `NaN` ou `undefined`; suíte passa. Enquanto as OQs estiverem pendentes, os exemplos de formatação ficam bloqueados.
- **Dependências:** T-04, T-17.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test.

### T-20 — Testar cálculo de datas
- **Descrição:** verificar timezone, meia-noite e limites de calendário.
- **Requisitos relacionados:** RF-03 (AC-06, AC-08); RNF-05.
- **Critérios de aceite:** Vitest verifica a janela AC-06, timezone distinto de UTC/dispositivo, viradas de dia/mês/ano e exatamente cinco datas únicas; suíte passa.
- **Dependências:** T-05, T-17.
- **Arquivos prováveis:** `tests/unit/date.test.ts`.
- **Tipo:** Test.

### T-21 — Testar mapeamento WMO
- **Descrição:** verificar códigos conhecidos e desconhecidos.
- **Requisitos relacionados:** RF-02 (AC-04), RF-03 (AC-07); RNF-08.
- **Critérios de aceite:** Vitest compara a saída de todos os códigos presentes no mapa com suas strings pt-BR e verifica que um código numérico não mapeado retorna exatamente `Condição indisponível`; suíte passa.
- **Dependências:** T-06, T-17.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.

### T-22 — Testar geocoding
- **Descrição:** testar HTTP e normalização usando `fetch` mockado.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-06 (AC-18, AC-19); RNF-04, RNF-07.
- **Critérios de aceite:** Vitest verifica query/URL, mapeamento, vazio, homônimos, coordenadas/schema inválidos, rede e HTTP 4xx/5xx; `fetch` é mockado em todos os casos.
- **Dependências:** T-07, T-17.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`.
- **Tipo:** Test.

### T-23 — Testar forecast
- **Descrição:** testar query, normalização e falhas com respostas simuladas.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05), RF-03 (AC-06 a AC-08), RF-05 (AC-15, AC-17), RF-07 (AC-20, AC-21); RNF-04, RNF-05.
- **Critérios de aceite:** Vitest verifica URL/parâmetros, payload completo/parcial, timezone/unidades, schema/arrays inválidos, timeout controlado, rede e HTTP 429/5xx; `fetch` é mockado em todos os casos e nenhuma chamada sai para a rede real.
- **Dependências:** T-08, T-17.
- **Arquivos prováveis:** `tests/unit/forecastService.test.ts`.
- **Tipo:** Test.

### T-24 — Testar hook e transições
- **Descrição:** testar estados e operações assíncronas sem rede.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-04 (AC-11), RF-05 (AC-13 a AC-17), RF-06 (AC-18, AC-19); RNF-04, RNF-05.
- **Critérios de aceite:** testes afirmam as transições idle → loading → empty/success/error e loading → selectingCity → loading forecast → success; retry chama uma vez a mesma operação; resposta A atrasada não substitui busca B; alternar unidade não aumenta o número de chamadas forecast; timeout controlado termina em error.
- **Dependências:** T-09, T-17.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.

### T-25 — Testar busca e seleção
- **Descrição:** testar formulário e resultados com Testing Library.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-06 (AC-18, AC-19); RNF-01, RNF-02, RNF-08.
- **Critérios de aceite:** testes assertam callback ausente para input vazio, query emitida no submit, opções homônimas e cidade selecionada; interação por teclado e queries role/label.
- **Dependências:** T-11, T-17.
- **Arquivos prováveis:** `tests/unit/SearchComponents.test.tsx`.
- **Tipo:** Test.

### T-26 — Testar visualização meteorológica
- **Descrição:** testar renderização de clima atual e previsão.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05, D-06), RF-03 (AC-06 a AC-08, D-07), RF-07 (AC-20, AC-21); RNF-02, RNF-05, RNF-08.
- **Critérios de aceite:** Testing Library verifica cidade, temperatura convertida, ícone/condição, as quatro métricas atuais com unidades e cards diários com rótulo, máxima, mínima e probabilidade de chuva (%); variantes nulas exibem `—`; consultas usam roles/labels acessíveis.
- **Dependências:** T-12, T-17.
- **Arquivos prováveis:** `tests/unit/WeatherDisplay.test.tsx`.
- **Tipo:** Test.

### T-27 — Testar seletor de unidade
- **Descrição:** testar estado inicial e alternância acessível.
- **Requisitos relacionados:** RF-04 (AC-09 a AC-11); RNF-02, RNF-08.
- **Critérios de aceite:** teste verifica Celsius inicial, seleção por teclado, unidade anunciada e callback correto sem request.
- **Dependências:** T-13, T-17.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.

### T-28 — Testar componentes de estado
- **Descrição:** testar carregamento, vazio e erro isoladamente.
- **Requisitos relacionados:** RF-01 (AC-03), RF-05 (AC-13 a AC-16); RNF-02, RNF-04, RNF-08.
- **Critérios de aceite:** testes encontram cada estado por role/label; verificam mensagem pt-BR, ausência de detalhes internos e callback de retry chamado uma vez.
- **Dependências:** T-14, T-15, T-16, T-17.
- **Arquivos prováveis:** `tests/unit/WeatherStates.test.tsx`.
- **Tipo:** Test.

### T-29 — Testar composição da aplicação
- **Descrição:** validar transições visíveis com serviços simulados.
- **Requisitos relacionados:** RF-01 a RF-07 (AC-01 a AC-21); RNF-01, RNF-02, RNF-04, RNF-05, RNF-08.
- **Critérios de aceite:** serviços controlados verificam idle/loading/empty/error/success, busca/retry e dados selecionados; alternar unidade não aumenta chamadas forecast.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.

## Entrega 8 — Integração E2E

### T-30 — Testar busca ponta a ponta
- **Descrição:** validar busca, geocoding vazio e seleção com Playwright.
- **Requisitos relacionados:** RF-01 (AC-01 a AC-03), RF-05 (AC-13, AC-14), RF-06 (AC-18, AC-19); RNF-01, RNF-02, RNF-08.
- **Critérios de aceite:** Playwright intercepta rotas; verifica submit válido, ausência de request para input vazio, vazio e seleção correta entre homônimos; não acessa API real.
- **Dependências:** T-17, T-25, T-29.
- **Arquivos prováveis:** `tests/e2e/search.spec.ts`.
- **Tipo:** Test.

### T-31 — Testar forecast e unidade ponta a ponta
- **Descrição:** validar o fluxo principal completo da busca de cidade à previsão e alternância de unidade em viewport mobile.
- **Requisitos relacionados:** RF-02 (AC-04, AC-05), RF-03 (AC-06 a AC-08), RF-04 (AC-09 a AC-12), RF-07 (AC-20, AC-21); RNF-01, RNF-05, RNF-08.
- **Critérios de aceite:** Playwright executa busca, seleção, clima atual, cinco datas e alternância Celsius/Fahrenheit em viewport de 375 × 812 px; fixtures verificam cidade, datas, valores, fonte/referência e unidade; alternância não gera nova chamada forecast; `page.route` intercepta as APIs e nenhuma chamada real é feita.
- **Dependências:** T-17, T-26, T-27, T-29.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

### T-32 — Testar falhas ponta a ponta
- **Descrição:** validar timeout, erro e retry no browser.
- **Requisitos relacionados:** RF-05 (AC-14 a AC-17); RNF-02, RNF-04, RNF-07.
- **Critérios de aceite:** fixtures simulam rede/timeout e retry; mensagem não expõe payload; retry conclui sem reload; resposta atrasada não substitui busca atual.
- **Dependências:** T-17, T-28, T-29.
- **Arquivos prováveis:** `tests/e2e/resilience.spec.ts`.
- **Tipo:** Test.

## Entrega 9 — Hardening

### T-33 — Verificar viewports e navegadores
- **Descrição:** validar responsividade e matriz de compatibilidade aprovada.
- **Requisitos relacionados:** RNF-01, RNF-06.
- **Critérios de aceite:** após OQ-10 definir a matriz de navegadores, executar os fluxos essenciais em cada versão registrada; cobrir larguras de 320, 375, 768 e 1440 px e zoom de 200%; reportar por combinação viewport/navegador se houve overflow horizontal, controle cortado ou falha. Enquanto OQ-10 estiver pendente, a tarefa fica bloqueada.
- **Dependências:** T-18, T-19, T-20, T-21, T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32 e aprovação de OQ-10.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-34 — Auditar acessibilidade
- **Descrição:** adicionar a ferramenta de auditoria automatizada aprovada para WCAG.
- **Requisitos relacionados:** RNF-02.
- **Critérios de aceite:** após aprovação da ferramenta em OQ-10, ela aparece em `devDependencies`; `pnpm-lock.yaml` corresponde ao `package.json`; `pnpm install --frozen-lockfile` termina com código 0. Esta tarefa não implementa os testes de auditoria.
- **Dependências:** T-29, T-33 e aprovação de OQ-10.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Tipo:** Infra.

### T-35 — Medir orçamento de desempenho
- **Descrição:** verificar LCP/CLS com perfil reprodutível da spec.
- **Requisitos relacionados:** RNF-03.
- **Critérios de aceite:** após OQ-10 aprovar ferramenta/perfil, executar 20 carregamentos com cache frio, viewport 375 × 812, download 1,6 Mbps, upload 750 Kbps, latência 150 ms e CPU 4× mais lenta; relatório inclui os 20 resultados e p75; tarefa passa somente se LCP p75 ≤ 2,5 s e CLS p75 ≤ 0,1. Enquanto OQ-10 estiver pendente, a tarefa fica bloqueada.
- **Dependências:** T-29, T-33 e aprovação de OQ-10.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-36 — Executar auditoria automatizada WCAG
- **Descrição:** verificar os fluxos essenciais com a ferramenta aprovada e instalada em T-34.
- **Requisitos relacionados:** RNF-02.
- **Critérios de aceite:** Playwright executa a auditoria nas telas de busca, seleção, sucesso, vazio e erro; a tarefa passa com zero violações críticas/altas e falha caso qualquer uma seja encontrada; resultados ou violações são reportados no teste.
- **Dependências:** T-29, T-33, T-34 e aprovação de OQ-10.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.
- **Tipo:** Test.

### T-37 — Revisar acessibilidade manualmente
- **Descrição:** registrar a verificação manual de teclado, foco e leitor de tela.
- **Requisitos relacionados:** RNF-02.
- **Critérios de aceite:** checklist registra aprovação/reprovação dos fluxos de busca, seleção, mudança de unidade e retry por teclado; confirma foco visível e anúncio dos estados loading/erro por leitor de tela; toda falha aponta o fluxo afetado.
- **Dependências:** T-29, T-33 e aprovação de OQ-10.
- **Arquivos prováveis:** `docs/accessibility-checklist.md`.
- **Tipo:** Test.

## Sequência sugerida — fatias verticais

1. **Primeira entrega visível — busca até previsão:** concluir T-01 a T-17 em ordem de dependência. O resultado é uma aplicação navegável que busca/seleciona uma cidade, apresenta clima atual e cinco dias, troca unidade e trata estados básicos. Fazer uma demo assim que T-17 estiver integrada; não esperar pelas auditorias de hardening.
2. **Confiança no fluxo principal:** executar T-18, T-20 e T-22 a T-31. Essa fatia valida conversão, janela de datas, integração com serviços mockados, estados de UI e os fluxos E2E de busca e previsão, inclusive mobile em T-31.
3. **Resiliência e consistência:** concluir T-19, T-21 e T-32 para cobrir formatação/códigos meteorológicos e recuperação de falhas ponta a ponta.
4. **Pronto para release:** concluir T-33 a T-37, cobrindo viewports/navegadores, configuração e auditorias de acessibilidade, e metas de desempenho aprovadas.

Dentro de cada fatia, respeitar as dependências declaradas. P1 continua obrigatório antes de release; a prioridade indica sequência, não dispensa critérios da spec.

## Gates de conclusão

Antes de concluir tarefas de código em `src/` ou `tests/`, executar `pnpm lint`, `pnpm build` e `pnpm test`. Executar `pnpm test:e2e` para T-30 a T-36; concluir também a revisão manual de T-37. Registrar bloqueios de ambiente sem presumir aprovação de critérios não executados.