# Weather App — Especificação de Produto

## Overview

**Status:** rascunho para validação; não autoriza implementação antes da aprovação
das pendências bloqueadoras e da produção do plano técnico e do backlog.

**Fonte:** [Discovery](discovery.md). Os identificadores RF-01 a RF-05 preservam
a rastreabilidade dos requisitos do discovery. Novos comportamentos e metas são
propostas explícitas, não decisões já aprovadas.

O produto permitirá consultar o clima de uma cidade e a previsão de hoje e dos
quatro dias seguintes, alternando entre Celsius e Fahrenheit. A experiência deve
ser utilizável em dispositivos móveis e apoiar decisões cotidianas e planejamento
de atividades, sem garantir condições futuras nem substituir alertas oficiais.

### Decisões confirmadas

| Origem | Decisão |
| --- | --- |
| D-01 | Fonte de dados: Open-Meteo, sem API key. As condições de uso ainda precisam ser validadas. |
| D-02 | Cinco dias significa hoje e os quatro dias seguintes. |
| D-03 | Celsius é a unidade padrão; Fahrenheit permanece disponível. |
| D-04 | Sem autenticação e sem persistência de servidor. Isso não decide armazenamento local nem impede, por si só, um serviço intermediário sem persistência. |
| D-05 | Idioma da interface: pt-BR. |
| D-06 | Clima atual exibe temperatura, condição, umidade relativa (%), velocidade do vento (km/h), precipitação (mm) e pressão de superfície (hPa). Valores ausentes são identificados como indisponíveis. |
| D-07 | A previsão será um resumo diário de cinco datas com condição, mínima, máxima e probabilidade máxima de precipitação em porcentagem; campos ausentes permanecem indisponíveis. |

### Público e sucesso

Personas propostas na seção Personas propostas do [Discovery](discovery.md),
ainda sujeitas à validação de OQ-01:

- Mariana, profissional em deslocamento: entender rapidamente as condições na
  cidade consultada, principalmente no celular.
- Rafael, viajante ocasional: consultar os cinco dias no destino, no desktop ou
  celular, na unidade de temperatura de sua preferência.
- Cláudia, praticante de atividades ao ar livre: comparar dias sem interpretar a
  previsão como garantia.

Sucesso funcional: concluir busca, identificação da cidade, consulta atual,
consulta dos cinco dias e alternância de unidade sem ajuda. Metas de tempo de
tarefa, adoção e satisfação dependem de validação; não há resultados medidos.

## Functional Requirements

“Confirmado” indica capacidade aprovada no discovery, não aprovação automática de
seus detalhes propostos. Critérios que dependem de uma suposição são condicionais
à sua aprovação ou revisão.

| ID | Requisito | Origem e status | Critérios |
| --- | --- | --- | --- |
| RF-01 | Permitir buscar cidades por nome, iniciar nova busca e informar quando não houver correspondências. | Discovery RF-01, confirmado. Forma de confirmação e validação de entrada propostas em A-02. | AC-01 a AC-03 |
| RF-02 | Exibir o clima atual associado à cidade selecionada, incluindo temperatura, condição e métricas atuais definidas em D-06. | Discovery RF-02; campos mínimos atuais definidos em D-06. | AC-04 e AC-05 |
| RF-03 | Exibir o resumo diário da previsão para cinco datas consecutivas, começando hoje. | Discovery RF-03, D-02 e D-07. Fuso e formato da data propostos em A-05. | AC-06 a AC-08 |
| RF-04 | Permitir alternar todas as temperaturas entre Celsius e Fahrenheit, começando em Celsius. | Discovery RF-04 e D-03, confirmado. Precisão e retenção propostas em A-06 e A-07. | AC-09 a AC-12 |
| RF-05 | Informar estado inicial, carregamento, vazio e erro, com recuperação após falha. | Discovery RF-05, proposta a aprovar. Inclui prevenção de mistura de resultados de consultas diferentes. | AC-13 a AC-17 |
| RF-06 | Permitir selecionar explicitamente a cidade quando houver múltiplas correspondências, diferenciando região e país quando disponíveis. | Desdobramento proposto de RF-01 e PA-05; depende de OQ-04. | AC-18 e AC-19 |
| RF-07 | Identificar a fonte e a referência temporal dos dados apresentados, sem confundir horário da consulta com horário dos dados. | Proposta derivada de PA-10 e dos riscos de desatualização; depende de OQ-03 e OQ-09. | AC-20 e AC-21 |

## User Stories

As histórias usam as personas propostas no discovery. Seus objetivos não aprovam
automaticamente novos indicadores ou funcionalidades fora dos requisitos abaixo.

| ID | História | Requisitos | Critérios |
| --- | --- | --- | --- |
| US-01 | Como Mariana, profissional em deslocamento, quero buscar minha cidade e selecioná-la entre as correspondências para consultar o clima da localidade correta antes de sair. | RF-01, RF-06 | AC-01 a AC-03, AC-18 e AC-19 |
| US-02 | Como Mariana, profissional em deslocamento, quero consultar a temperatura e a condição atual da minha cidade para decidir como me vestir antes de sair de casa. | RF-02 | AC-04 e AC-05 |
| US-03 | Como Rafael, viajante ocasional, quero consultar a previsão de hoje e dos quatro dias seguintes no destino para preparar minha mala e organizar os passeios. | RF-03 | AC-06 a AC-08 |
| US-04 | Como Rafael, viajante ocasional, quero alternar todas as temperaturas entre Celsius e Fahrenheit para interpretar o clima na escala com que tenho familiaridade. | RF-04 | AC-09 a AC-12 |
| US-05 | Como Mariana, profissional em deslocamento, quero acompanhar o estado da consulta e tentar novamente após uma falha para conseguir consultar o clima mesmo após uma interrupção da conexão. | RF-05 | AC-13 a AC-17 |
| US-06 | Como Cláudia, praticante de atividades ao ar livre, quero comparar as condições previstas para os cinco dias para escolher quando realizar uma atividade. | RF-03 | AC-06 a AC-08 |
| US-07 | Como Cláudia, praticante de atividades ao ar livre, quero identificar a fonte e a referência temporal dos dados para reconhecer informações anteriores antes de planejar minha atividade. | RF-07 | AC-20 e AC-21 |

Os fluxos de todas as histórias devem atender aos requisitos de responsividade e
acessibilidade, não apenas ao caminho de sucesso.

### Matriz de rastreabilidade

| User Story | Acceptance Criteria | Requisitos não-funcionais relevantes | Relação com a história |
| --- | --- | --- | --- |
| US-01 | AC-01 a AC-03, AC-18 e AC-19 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 | Busca e seleção precisam funcionar em telas móveis, ser acessíveis, responsivas, disponíveis nos navegadores suportados, protegidas e apresentadas em pt-BR. |
| US-02 | AC-04 e AC-05 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 | Consulta atual exige leitura acessível, desempenho, tratamento de indisponibilidade, associação correta entre cidade e dados, transporte seguro e apresentação localizada. |
| US-03 | AC-06 a AC-08 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 | Previsão deve preservar datas e valores por cidade, permanecer utilizável e acessível em dispositivos suportados e tratar dados incompletos. |
| US-04 | AC-09 a AC-12 | RNF-01, RNF-02, RNF-03, RNF-05, RNF-06, RNF-08 | A alternância precisa ser operável e acessível, refletir-se sem atraso indevido, manter consistência numérica e respeitar idioma e dispositivos suportados. |
| US-05 | AC-13 a AC-17 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 | Estados e recuperação precisam ser perceptíveis e acessíveis, funcionar em falhas e navegadores suportados e não expor detalhes sensíveis. |
| US-06 | AC-06 a AC-08 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 | Comparar dias depende de dados e datas consistentes, leitura acessível e experiência responsiva mesmo quando parte da previsão está indisponível. |
| US-07 | AC-20 e AC-21 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 | Fonte e referência temporal precisam ser legíveis, localizadas, consistentes e não podem sugerir atualização incorreta; falhas não devem apresentar dados como atuais. |

Para interpretação da matriz: RNF-01 responsividade; RNF-02 acessibilidade;
RNF-03 desempenho; RNF-04 confiabilidade; RNF-05 consistência; RNF-06
compatibilidade; RNF-07 privacidade e segurança; RNF-08 localização/pt-BR.
Os RNFs listados são critérios transversais aplicáveis ao fluxo, não novos
requisitos funcionais nem aprovação automática das propostas ainda pendentes.

## Acceptance Criteria

Os cenários abaixo devem ser verificáveis com dados controlados, inclusive falhas,
sem exigir que a previsão real de uma cidade tenha um valor específico. Valores,
datas e nomes usados nos testes são exemplos, não dados fixos do produto.

Given descreve a precondição; When, a ação ou evento; Then, o resultado observável.
Cada variante indicada deve ser executada como cenário independente. Relógio,
fuso, respostas e ordem de conclusão devem ser controlados nos testes; não usar
esperas reais para simular timeout. A coluna Dependências identifica propostas
que precisam de aprovação, sem alterar as decisões confirmadas.

| ID | Requisito | Given | When | Then | Dependências |
| --- | --- | --- | --- | --- | --- |
| AC-01 | RF-01 | O campo contém “Lisboa” e a fonte retorna uma única cidade identificada como Lisboa, Portugal. | O usuário confirma a busca e a resposta é recebida. | A cidade encontrada fica identificada como Lisboa, Portugal, e sua consulta meteorológica é iniciada; o usuário pode substituir o nome e confirmar outra busca sem recarregar a página. | A-02 |
| AC-02 | RF-01 | O campo de busca está vazio ou contém apenas espaços; executar uma variante para cada entrada. | O usuário tenta confirmar a busca. | Nenhuma consulta externa é iniciada e uma mensagem em pt-BR informa que o nome da cidade deve ser preenchido. | A-02 |
| AC-03 | RF-01 | Uma busca por “CidadeInexistente” está pendente e sua resposta contém zero correspondências. | A resposta vazia é recebida. | O carregamento termina, uma mensagem de ausência de resultados é exibida sem mensagem de falha de rede, e o campo permite corrigir e confirmar uma nova busca. | RF-05 proposto |
| AC-04 | RF-02 | Lisboa, Portugal, foi selecionada, a unidade é Celsius e os dados controlados contêm 20 °C, céu limpo, umidade 68%, vento 14,4 km/h, precipitação 0,2 mm e pressão 1015,2 hPa. | A resposta meteorológica é recebida. | A interface identifica Lisboa, Portugal; mostra 20 °C, céu limpo e cada métrica com seu valor e unidade em pt-BR. | D-06 |
| AC-05 | RF-02 | Uma cidade foi selecionada e a resposta omite ou retorna nulo para uma ou mais métricas atuais; executar variantes para temperatura, umidade, vento, precipitação e pressão. | A resposta meteorológica é recebida. | Cada campo indisponível mostra o fallback definido pela UI, nunca zero, NaN, undefined ou dado de outra cidade; os demais valores válidos continuam visíveis. | D-06 |
| AC-06 | RF-03 | O relógio indica 29/10/2026 às 23:30 em America/Sao_Paulo e 30/10/2026 em UTC; a cidade usa America/Sao_Paulo e há previsão completa para a janela. | A previsão da cidade é apresentada. | As cinco datas exibidas são exatamente 29/10/2026, 30/10/2026, 31/10/2026, 01/11/2026 e 02/11/2026, nessa ordem, sem duplicações e sem deslocamento pela data UTC do dispositivo. | D-07, A-05 |
| AC-07 | RF-03 | A resposta contém cinco resumos diários completos, com mínimas 10–14 °C, máximas 20–24 °C, condições WMO e probabilidades de precipitação 10%, 20%, 30%, 40% e 50%, associadas às respectivas datas; a unidade é Celsius. | A resposta de previsão é recebida. | Cada dia mostra rótulo/data, condição, mínima, máxima e probabilidade de precipitação com `%`, preservando a associação dos valores com a data e sem repetir dados de outro dia. | D-07; formato/fuso em A-05 |
| AC-08 | RF-03 | A janela vai de 29/10 a 02/11/2026, mas a resposta omite 31/10 e inclui 03/11 como data adicional. | A resposta de previsão é recebida. | A janela permanece com as cinco datas esperadas; 31/10 é identificado como sem informação, não recebe valores inventados e não é substituído por 03/11. | D-07, A-05 |
| AC-09 | RF-04 | É um novo acesso sem preferência restaurada e a resposta controlada contém temperatura equivalente a 20 °C. | O usuário abre a aplicação e conclui a primeira consulta. | Celsius está selecionado e a temperatura é apresentada como 20 °C; todos os valores de temperatura exibem sua unidade. | A-07 |
| AC-10 | RF-04 | Clima atual e previsão estão carregados em Celsius; executar variantes com valores equivalentes a 0 °C, 20 °C e −10 °C em cada posição de temperatura atual, mínima e máxima. | O usuário seleciona Fahrenheit. | Todas as posições exibem os equivalentes 32 °F, 68 °F e 14 °F, respectivamente; nenhum valor permanece identificado em Celsius. | A-06 |
| AC-11 | RF-04 | Uma cidade e suas cinco datas estão carregadas em Celsius com valores originais registrados e nenhuma consulta meteorológica pendente. | O usuário alterna para Fahrenheit e volta a Celsius cinco vezes. | Cidade, datas e temperaturas finais são iguais às iniciais na precisão exibida, e nenhuma nova consulta meteorológica é iniciada apenas pelas trocas. | A-06 |
| AC-12 | RF-04 | Os dados contêm um valor fracionário; executar separadamente os casos 20,4 °C → 20 °C, 20,4 °C → 69 °F, −10,5 °C → −11 °C, 10,5 °C → 11 °C e −0,1 °C → 0 °C. | O usuário consulta os dados ou seleciona a unidade de destino indicada no caso. | O valor exibido corresponde exatamente ao resultado esperado do caso, sem zero negativo. | A-06 |
| AC-13 | RF-05 | Nenhuma cidade foi consultada no novo acesso. | O usuário abre a aplicação. | Uma orientação em pt-BR solicita iniciar a busca, sem mensagem de falha, temperaturas fictícias ou consulta meteorológica de uma cidade não escolhida. | RF-05 proposto |
| AC-14 | RF-05 | Uma consulta controlada pode permanecer pendente e depois terminar em sucesso, zero correspondências ou falha; executar uma variante por desfecho. | O usuário inicia a consulta e, após observar o estado pendente, a resposta correspondente é liberada. | A indicação de carregamento é visível antes da resposta; após a conclusão, ela desaparece e é substituída pelo resultado, mensagem de vazio ou mensagem de erro correspondente, sem estados terminais conflitantes. | RF-05 proposto |
| AC-15 | RF-05 | Uma consulta está pendente; executar variantes para falha de conexão, HTTP 503, HTTP 429 e ausência de resposta por 10 segundos. | A falha é recebida ou o relógio controlado atinge o limite de timeout. | O carregamento termina, uma mensagem em pt-BR informa a impossibilidade de concluir a consulta e uma ação de nova tentativa fica disponível; não são exibidos stack trace, credenciais ou corpo bruto da resposta. | RF-05 proposto, A-08 |
| AC-16 | RF-05 | A última operação falhou; executar variantes para busca de cidades e consulta meteorológica de uma cidade selecionada, com próxima resposta configurada para sucesso. | O usuário solicita nova tentativa e a resposta bem-sucedida é recebida. | A operação repete o mesmo nome de busca ou a mesma identidade geográfica que falhou, remove o erro e apresenta o resultado correspondente, sem exigir recarregamento da página. | RF-05 proposto |
| AC-17 | RF-05 | A consulta da cidade A começou antes da consulta da cidade B, mas sua resposta permanece retida; executar variantes em que B está pendente, concluiu com sucesso ou falhou. | A resposta atrasada de A é recebida depois de B se tornar a intenção mais recente. | A não substitui a seleção, os dados ou o estado de B; dados antigos de A, caso mantidos, continuam identificados como de A e anteriores, nunca como dados de B. | RF-05 proposto |
| AC-18 | RF-06 | A busca por “Springfield” tem duas correspondências: Springfield, Illinois, Estados Unidos, e Springfield, Massachusetts, Estados Unidos. | A resposta da busca é recebida. | As duas opções exibem cidade, região e país; nenhuma consulta meteorológica é iniciada até o usuário escolher uma delas. | A-02, RF-06 proposto |
| AC-19 | RF-06 | As duas correspondências de Springfield estão visíveis e possuem identidades geográficas distintas. | O usuário escolhe Springfield, Massachusetts, Estados Unidos, e sua resposta meteorológica é recebida. | A consulta usa a identidade geográfica da opção escolhida, não executa nova busca apenas pelo nome “Springfield” e identifica Massachusetts nos dados exibidos. | RF-06 proposto |
| AC-20 | RF-07 | Há dados atuais e previsão da Open-Meteo; executar variantes com referência atual de 29/10/2026 às 09:00 em America/Sao_Paulo e com referência temporal ausente. | Os dados são apresentados. | Open-Meteo é identificada como fonte; a primeira variante mostra data, hora e fuso fornecidos, e a segunda informa referência temporal indisponível sem inventar um horário. | A-05, RF-07 proposto |
| AC-21 | RF-07 | Os dados atuais têm referência de 29/10/2026 às 09:00 em America/Sao_Paulo, foram consultados às 09:15 e permanecem visíveis durante uma nova consulta pendente ou malsucedida; executar uma variante para cada estado. | O usuário visualiza os dados anteriores durante a nova consulta. | A referência meteorológica permanece 09:00, não é substituída por 09:15 nem pelo horário da nova tentativa, e os dados mantidos são identificados como anteriores. | A-05, RF-07 proposto; política final em OQ-09 |

## Non-Functional Requirements

Uso móvel e idioma pt-BR são confirmados. Os limites quantitativos e padrões abaixo
são propostas para aprovação em OQ-10; não constituem SLA acordado. Comportamentos
de carregamento e recuperação pertencem a RF-05, não às metas de desempenho.

| ID | Atributo | Critério de qualidade proposto | Verificação |
| --- | --- | --- | --- |
| RNF-01 | Responsividade | Fluxos completos em larguras de 320, 375, 768 e 1440 pixels CSS, sem sobreposição ou rolagem horizontal da página; conteúdo utilizável com zoom de 200%. | Inspeção dos estados inicial, resultados, sucesso e erro, com interação por toque e teclado. |
| RNF-02 | Acessibilidade | Atender à WCAG 2.2 AA nos fluxos do escopo; nomes acessíveis, foco visível, ordem de navegação coerente, estados anunciados e informação não dependente apenas de cor ou ícones. | Avaliação automática e manual com teclado e leitor de tela; automação isolada não comprova conformidade. |
| RNF-03 | Desempenho | Em ambiente de homologação, alcançar LCP ≤ 2,5 s e CLS ≤ 0,1 no percentil 75 de 20 carregamentos com cache frio, viewport de 375 × 812, download de 1,6 Mbps, upload de 750 Kbps, latência de 150 ms e redução de CPU de 4 vezes. Respostas meteorológicas controladas para tornar a medição reprodutível. | Registrar navegador, equipamento e medições; avaliar a latência do provedor separadamente. |
| RNF-04 | Confiabilidade | Todos os cenários de rede e dados incompletos previstos em Edge Cases devem permitir nova busca sem recarregar a página e sem encerramento inesperado da interface. Disponibilidade mensal ainda não definida. | Executar cenários com respostas e falhas controladas. SLA e monitoramento dependem de OQ-11. |
| RNF-05 | Consistência | Nenhuma tela pode misturar temperaturas de unidades ou cidades diferentes; datas e números devem seguir as regras aprovadas em A-05 e A-06. | Comparar clima e previsão antes e depois de trocar unidade e cidade, incluindo fusos diferentes. |
| RNF-06 | Compatibilidade | Suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari disponíveis na aprovação, incluindo Chrome Android e Safari iOS. Fixar versões concretas na matriz de homologação. | Executar os fluxos essenciais na matriz aprovada e registrar versões. |
| RNF-07 | Privacidade e segurança | Usar HTTPS em produção; não exigir contas nem armazenar dados em servidor; não solicitar localização automática sem aprovação; não expor segredos ou detalhes internos nas mensagens. | Inspecionar permissões, tráfego, mensagens e dados armazenados. Logs e analytics dependem de OQ-12. |
| RNF-08 | Localização | Textos, controles, erros e condições meteorológicas descritos em pt-BR; nomes próprios de cidades podem manter a grafia do provedor. Formatos seguem A-05. | Revisar todos os estados da interface, incluindo condições desconhecidas e erros. |

## Edge Cases

| ID | Situação | Comportamento esperado | Referência |
| --- | --- | --- | --- |
| EC-01 | Nome vazio ou formado por espaços. | Solicitar preenchimento sem consulta externa. | AC-02 |
| EC-02 | Nome com acentos, espaços externos ou caracteres de outro alfabeto. | Preservar caracteres significativos, ignorar espaços externos e não falhar; tolerância a erros e transliterações depende de OQ-04. | RF-01, A-02 |
| EC-03 | Nenhuma cidade encontrada. | Informar vazio e permitir nova busca. | AC-03 |
| EC-04 | Cidades homônimas ou identificadores regionais ausentes. | Exibir os identificadores disponíveis e não inventar região ou país; diferenciação adicional depende de OQ-04. | AC-18 |
| EC-05 | Falha de rede, timeout, limite de requisições ou serviço indisponível. | Informar falha e permitir recuperação, sem repetição automática ilimitada. | AC-15 e AC-16 |
| EC-06 | Temperatura ausente, resposta inválida ou condição meteorológica desconhecida. | Não inventar números; informar indisponibilidade do campo ou da consulta. Para condição desconhecida, usar descrição textual neutra. | AC-05, RF-05, RNF-08 |
| EC-07 | Dias ou indicadores da previsão ausentes. | Preservar datas da janela, identificar lacunas e não preencher com outro dia. | AC-08 |
| EC-08 | Meia-noite, virada de mês/ano ou horário de verão. | Manter cinco datas de calendário consecutivas no fuso aprovado; não presumir que todo dia tenha exatamente 24 horas. | AC-06, A-05 |
| EC-09 | Temperaturas negativas, zero e valores fracionários. | Aplicar conversão e arredondamento aprovados, sem tratar zero como dado ausente ou exibir zero negativo. | AC-10 a AC-12, A-06 |
| EC-10 | Troca de unidade durante consulta. | Apresentar os dados recebidos na unidade atualmente selecionada. | RF-04, RNF-05 |
| EC-11 | Consultas concluídas fora de ordem. | Manter a intenção mais recente, sem misturar cidades. | AC-17 |
| EC-12 | Nome de cidade longo, zoom ou tela pequena. | Permitir leitura e operação sem ocultar controles ou sobrepor conteúdo. | RNF-01 e RNF-02 |
| EC-13 | Conexão perdida após exibir dados. | Não afirmar atualização bem-sucedida; se os dados anteriores permanecerem, identificá-los e permitir nova tentativa. | AC-21, OQ-09 |

## Assumptions

As regras abaixo tornam o rascunho testável, mas são hipóteses ou propostas, não
decisões confirmadas do discovery. Uma rejeição exige atualizar os requisitos e
critérios vinculados antes da aprovação.

| ID | Suposição ou proposta | Pendência relacionada |
| --- | --- | --- |
| A-01 | Primeira entrega como aplicação web responsiva, uma cidade por consulta, sem aplicativos nativos. | S-01 e S-02 do discovery; OQ-01 e OQ-07. |
| A-02 | Busca confirmada pelo usuário, sem autocomplete obrigatório; espaços externos ignorados e entrada vazia rejeitada. Uma correspondência pode abrir diretamente; múltiplas exigem seleção. | PA-05; OQ-04. |
| A-03 (parcialmente resolvida por D-06) | Clima atual contém identificação, temperatura, condição, umidade relativa, velocidade do vento, precipitação e pressão de superfície; campos individuais podem estar indisponíveis. Sensação térmica não foi solicitada; outros indicadores podem ser reavaliados. | PA-03; OQ-02. |
| A-04 (convertida em D-07) | Previsão em resumo diário de cinco datas com data, mínima, máxima, condição textual e probabilidade máxima de precipitação (%). | PA-04; D-07. |
| A-05 | “Hoje” usa o fuso da cidade; datas no formato DD/MM/AAAA, horas em formato de 24 horas com fuso identificado e números com convenções pt-BR. | Pendência de PA-02 e PA-06; OQ-03 e OQ-05. |
| A-06 | Conversão matemática padrão entre Celsius e Fahrenheit; exibição em graus inteiros, arredondamento para o inteiro mais próximo e empates afastados de zero. Preservar precisão para evitar erro acumulado e normalizar zero negativo. | RF-04; OQ-06. |
| A-07 | Unidade escolhida mantida nas buscas da mesma sessão da página; novo acesso começa em Celsius, sem restauração local obrigatória. | PA-07; OQ-06. |
| A-08 | Uma operação externa sem resposta após 10 segundos é considerada timeout; recuperação por ação explícita do usuário, sem tentativas automáticas obrigatórias. | RF-05; OQ-08. |
| A-09 | Conexão à internet necessária; sem obrigação de modo offline, atualização automática, histórico ou favoritos nesta versão. Cache de dados e sua validade ainda não foram aprovados. | S-03 e S-06; PA-10 e PA-12; OQ-07 e OQ-09. |

## Risks

Probabilidades qualitativas iniciais, não estimativas baseadas em operação real.

| ID | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R-01 | Aprovar implicitamente hipóteses como se fossem decisões. | Alta | Alto: refazer telas, regras e testes. | Revisar A-01 a A-09 e registrar aprovação ou alteração antes do plano. |
| R-02 | Cidade incorreta por homônimos. | Alta | Alto: informação de outra localidade. | Aprovar identificação e seleção explícita; verificar AC-18 e AC-19. |
| R-03 | Falha, latência ou limitação da Open-Meteo. | Média | Alto: consulta indisponível. | Validar condições de uso e tratar falhas, timeout e recuperação. |
| R-04 | Fuso ou mudança de data deslocar a janela da previsão. | Média | Alto: datas erradas. | Aprovar A-05 e verificar EC-08 com cidades em fusos distintos. |
| R-05 | Conversão, arredondamento ou dados ausentes gerarem informação enganosa. | Média | Alto: decisões baseadas em valores incorretos. | Aprovar regras e testar valores negativos, fracionários, ausentes e troca repetida de unidade. |
| R-06 | Interface inacessível ou inadequada no celular. | Média | Alto: exclusão de usuários. | Aprovar matriz de suporte e critérios de acessibilidade; avaliação manual e automatizada. |
| R-07 | Dados antigos serem apresentados como atuais ou previsão como garantia. | Média | Alto: confiança indevida. | Identificar referência temporal e fonte, sinalizar dados anteriores e delimitar finalidade informativa. |
| R-08 | Termos do provedor incompatíveis com o uso pretendido. | Média | Alto: restrições, custo ou revisão da integração. | Verificar licença, atribuição, cobertura, limites e eventual uso comercial antes da publicação. |
| R-09 | Inclusão tardia de geolocalização, contas ou sincronização. | Média | Alto: expansão de escopo e privacidade. | Registrar exclusões e exigir revisão explícita das decisões para novas capacidades. |

## Out of Scope

### Exclusões confirmadas

- Autenticação, criação de contas e funcionalidades que dependam de login (D-04).
- Persistência de dados no servidor (D-04).

### Exclusões propostas para a primeira versão

Sujeitas à validação em OQ-02 e OQ-07; não foram aprovadas apenas por estarem
ausentes do briefing:

- Aplicativos nativos, instalação como PWA e funcionamento offline obrigatório.
- Geolocalização automática, mapas e comparação simultânea de várias cidades.
- Histórico, favoritos e sincronização entre dispositivos.
- Previsão horária, período superior a cinco dias e indicadores além de A-03 e A-04.
- Alertas oficiais, notificações e recomendações de segurança personalizadas.
- Idiomas adicionais e restauração persistente da preferência de unidade.

Não oferecer garantia de precisão meteorológica nem substituir orientações de
autoridades. Detalhes de arquitetura e implementação pertencem ao plano técnico,
não a esta especificação.

## Open Questions

As decisões D-01 a D-05 permanecem válidas. As questões abaixo tratam das partes
ainda não resolvidas, sem reabrir escolhas confirmadas. Os responsáveis são papéis
propostos, a designar; não há prazo de calendário acordado.

| ID | Pergunta e origem no discovery | Impacto | Responsável proposto e marco |
| --- | --- | --- | --- |
| OQ-01 | Quem é o público prioritário, quais metas indicam sucesso e a entrega web é suficiente? PA-01, S-01. | Priorização e objetivos indefinidos. | Negócio/produto; antes de aprovar a spec. |
| OQ-02 | Parcialmente resolvida por D-06/D-07: campos mínimos do clima atual e do resumo diário estão definidos. Há necessidade de outros indicadores além desses? | Indicadores adicionais podem ampliar a resposta da API e o escopo; os campos já definidos podem ser implementados sem essa expansão. | Produto; antes de ampliar o escopo. |
| OQ-04 | Aprovar A-02? Qual cobertura geográfica, identificação de homônimos, limite de resultados e tolerância a erros de digitação serão exigidos? PA-05. | Busca e seleção ainda não têm limites completos. | Produto; antes de aprovar a spec. |
| OQ-06 | Aprovar A-06 e A-07? A preferência precisa sobreviver a uma nova visita? PA-07 e RF-04. | Muda regras de exibição e armazenamento local. | Produto; antes de aprovar a spec. |
| OQ-07 | Confirmar exclusões propostas, incluindo geolocalização, histórico, favoritos e sincronização? PA-08, PA-12, S-03. | Crescimento de escopo e conflito com D-04. | Produto; antes de aprovar a spec. |
| OQ-08 | Aprovar RF-05 a RF-07 e A-08, incluindo timeout, seleção e recuperação? Discovery RF-05. | Faltam comportamentos aprovados para fluxos essenciais e falhas. | Produto com apoio técnico; antes de aprovar a spec. |
| OQ-09 | Haverá cache ou atualização automática? Qual idade dos dados será aceitável e o que mostrar durante falha de atualização? PA-10. | Informação antiga pode parecer atual; muda comportamento esperado. | Produto com apoio técnico; antes de aprovar a spec. |
| OQ-10 | Aprovar metas, condições de medição, acessibilidade e matriz de navegadores de RNF-01 a RNF-08? PA-11. | Não existe acordo verificável de qualidade. | Produto/UX/qualidade; antes de aprovar a spec. |
| OQ-11 | Os termos da Open-Meteo atendem ao uso, volume e cobertura pretendidos? Qual disponibilidade será exigida e quem operará o produto? PA-09 e RNF-04. | Pode inviabilizar a operação ou exigir revisão das decisões. | Responsáveis técnico e de negócio; validar viabilidade antes do plano e obrigações antes da publicação. |
| OQ-12 | Haverá analytics ou logs? Que dados podem ser coletados, por quanto tempo e sob quais condições? RNF-07. | Coleta inadvertida de dados e conflito com a ausência de persistência de servidor. | Produto e responsável por privacidade; antes de planejar qualquer coleta. |

A spec somente deve ser marcada como aprovada após resolver as questões indicadas
para esse marco, atualizar critérios afetados e registrar o aceite dos responsáveis.
Pendências de operação ou publicação devem ter responsável e marco explícitos, sem
ser interpretadas como autorização para descumprir as decisões confirmadas.