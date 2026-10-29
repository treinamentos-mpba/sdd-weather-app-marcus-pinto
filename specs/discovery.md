# Discovery — Weather App

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para permitir que usuários
consultem condições atuais e planejem atividades com base em uma previsão de cinco
dias. A experiência deve permitir buscar cidades, alternar entre Celsius e
Fahrenheit e consultar informações em dispositivos móveis.

O público-alvo específico, os objetivos mensuráveis de negócio e os limites da
primeira entrega ainda precisam ser validados com as partes interessadas.
Como hipóteses de uso, uma pessoa pode consultar o clima para decidir o que vestir
ou comparar as condições previstas no destino de uma viagem.

Este documento é uma análise inicial, não uma especificação aprovada. Os requisitos
explicitamente presentes no briefing são identificados abaixo; propostas e
suposições não devem ser tratadas como compromissos confirmados.

### Personas propostas

Personas levantadas durante o discovery, ainda hipotéticas e sujeitas à validação
de PA-01. As metas abaixo são propostas, não resultados medidos.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso proposta |
| --- | --- | --- | --- |
| Mariana, profissional em deslocamento | Consultar o clima atual para decidir o que vestir e se leva guarda-chuva. | Mobile, antes de sair de casa, com pouco tempo e conexão variável. | Encontrar a cidade e entender as condições atuais em até 30 segundos, sem ajuda. |
| Rafael, viajante ocasional | Consultar os cinco dias no destino para preparar a mala e organizar passeios. | Desktop no planejamento e mobile durante a viagem, alternando entre Celsius e Fahrenheit conforme sua preferência. | Identificar o destino, consultar os cinco dias e visualizar a unidade preferida em até um minuto. |
| Cláudia, praticante de atividades ao ar livre | Comparar a previsão dos próximos dias para escolher quando realizar uma atividade. | Principalmente mobile, em consultas rápidas ao longo da semana. | Escolher um dia com base na previsão e reconhecer a referência temporal dos dados, sem confundir previsão com garantia. |

As personas não acrescentam indicadores obrigatórios ao produto: necessidades como
chuva e vento continuam sujeitas à validação em PA-03 e PA-04.

## Requisitos Funcionais

| ID | Requisito | Origem e pontos a esclarecer |
| --- | --- | --- |
| RF-01 | Permitir buscar cidades pelo nome para consultar o clima. | Confirmado no briefing. Definir tratamento de nomes iguais, resultados múltiplos e buscas sem correspondência. |
| RF-02 | Exibir o clima atual da cidade consultada. | Confirmado no briefing. Definir os indicadores apresentados e a identificação temporal dos dados. |
| RF-03 | Exibir a previsão do tempo de cinco dias para a cidade consultada. | Confirmado no briefing. Janela definida em D-02: hoje e os quatro dias seguintes. Definir se a apresentação será diária ou por horário e qual fuso determina “hoje”. |
| RF-04 | Permitir alternar a exibição de temperaturas entre Celsius e Fahrenheit. | Confirmado no briefing. Unidade padrão definida em D-03: Celsius. Definir arredondamento e eventual retenção da preferência. |
| RF-05 | Informar carregamento, ausência de resultados e falhas de consulta, oferecendo recuperação quando aplicável. | Proposta a validar para evitar uma experiência sem resposta ou ambígua. |

## Requisitos Não-Funcionais

| ID | Atributo | Necessidade e status |
| --- | --- | --- |
| RNF-01 | Responsividade | Confirmado no briefing: a aplicação deve ser utilizável em dispositivos móveis. Propõe-se ausência de rolagem horizontal e controles adequados ao toque; validar tamanhos de tela suportados. |
| RNF-02 | Acessibilidade | Proposta: permitir navegação por teclado, identificação acessível dos controles, contraste adequado e anúncio dos estados de consulta. Validar WCAG 2.2 nível AA como referência. |
| RNF-03 | Desempenho | Proposta: manter a interface responsiva durante consultas e apresentar feedback de carregamento. Definir metas de tempo de resposta e condições de rede antes da especificação. |
| RNF-04 | Confiabilidade | Proposta: preservar uma experiência compreensível em falhas de rede ou do provedor, sem apresentar dados antigos como atuais. Definir política de atualização e disponibilidade esperada. |
| RNF-05 | Consistência dos dados | Proposta: usar unidades, arredondamentos, datas e fusos horários coerentes em todas as temperaturas e previsões exibidas. Validar regras com o negócio. |
| RNF-06 | Compatibilidade | Proposta: funcionar nos navegadores móveis e desktop acordados. Definir navegadores e versões mínimos suportados. |
| RNF-07 | Privacidade e segurança | Proposta: minimizar a coleta de dados pessoais, usar conexões HTTPS e não expor credenciais caso o provedor as exija. Qualquer uso de localização precisa ser discutido explicitamente. |

## Riscos

As classificações abaixo são qualitativas e preliminares, sem histórico de operação
para confirmar as probabilidades.

| Risco | Probabilidade | Impacto | Mitigação proposta |
| --- | --- | --- | --- |
| Indisponibilidade, latência ou limite de requisições do provedor meteorológico. | Média | Alto: impede ou atrasa a consulta principal. | Validar limites e condições de uso; prever timeout, feedback de erro e nova tentativa. Avaliar cache sem ocultar a idade dos dados. |
| Busca selecionar uma cidade incorreta devido a nomes repetidos. | Alta | Alto: o usuário recebe previsão de outra localidade. | Diferenciar resultados por região e país; definir um fluxo de seleção sem ambiguidades. |
| Interpretação divergente do fuso horário que determina “hoje”. | Média | Alto: a previsão pode começar no dia errado. | Aplicar a janela hoje + quatro dias definida em D-02 e aprovar a referência de fuso antes da especificação. |
| Interface inadequada em telas pequenas ou com recursos assistivos. | Média | Alto: parte do público não consegue completar a consulta. | Definir requisitos de acessibilidade e validar fluxos em dispositivos móveis, teclado e leitor de tela. |
| Conversão ou arredondamento inconsistente entre Celsius e Fahrenheit. | Média | Médio: gera informação contraditória e reduz a confiança. | Definir uma regra única de conversão e precisão; testar clima atual e previsão nas duas unidades. |
| Dados desatualizados ou previsão incompleta serem interpretados como atuais e completos. | Média | Alto: prejudica decisões do usuário. | Definir identificação temporal, atualização e tratamento explícito de dados ausentes. |

## Perguntas em Aberto

As perguntas originais são preservadas para rastreabilidade. As resoluções abaixo
remetem à seção Decisões; os demais pontos continuam em aberto.

| ID | Pergunta | Impacto se não for respondida |
| --- | --- | --- |
| PA-01 | Quem é o público prioritário e qual resultado de negócio indicará sucesso? | Dificulta priorizar funcionalidades e avaliar se o produto atende à necessidade. |
| PA-02 | Resolvida por D-02: cinco dias significa hoje mais os quatro dias seguintes. | A ambiguidade da janela foi encerrada. O fuso que determina “hoje” ainda precisa ser definido. |
| PA-03 | Quais informações compõem o clima atual: temperatura, sensação térmica, condição, umidade, vento ou outras? | Impede delimitar os dados necessários e o conteúdo da tela. |
| PA-04 | A previsão será um resumo diário ou terá detalhamento por horário? Quais indicadores são obrigatórios? | Afeta o volume de dados, a complexidade e o esforço da entrega. |
| PA-05 | Como o usuário deve escolher entre cidades com o mesmo nome? Qual é a cobertura geográfica esperada? | Pode produzir consultas incorretas e excluir localidades relevantes. |
| PA-06 | Parcialmente resolvida por D-03 e D-05: Celsius e pt-BR. Qual será o formato de datas? | Sem definir o formato de datas, a apresentação pode ficar inconsistente apesar do idioma e da unidade já aprovados. |
| PA-07 | A preferência de unidade deve permanecer após recarregar a página? | Define se há necessidade de armazenamento local e testes adicionais. |
| PA-08 | O usuário poderá usar sua localização automaticamente ou apenas buscar cidades? | Altera escopo, permissões e requisitos de privacidade. |
| PA-09 | Parcialmente resolvida por D-01: Open-Meteo sem API key. Seus limites, licença, cobertura e custos são adequados ao uso pretendido? | A fonte foi escolhida, mas as condições de uso ainda podem impor restrições operacionais. |
| PA-10 | Haverá uso offline, cache ou atualização automática? Como indicar a idade dos dados? | Afeta confiabilidade, consumo de rede e a interpretação das informações exibidas. |
| PA-11 | Quais dispositivos, navegadores, metas de desempenho e nível de acessibilidade serão exigidos? | Impede estabelecer critérios de qualidade verificáveis. |
| PA-12 | Parcialmente resolvida por D-04: sem autenticação e sem persistência de servidor. Haverá histórico ou favoritos locais? Existe necessidade de sincronização que conflite com essa decisão? | Não esclarecer as funcionalidades restantes pode ampliar o escopo ou criar expectativas incompatíveis com a ausência de contas e armazenamento no servidor. |

## Decisões

Decisões confirmadas para orientar a especificação. As justificativas explicitam
seu propósito; não encerram as pendências indicadas na última coluna.

| ID | Decisão | Justificativa | Perguntas resolvidas e limites |
| --- | --- | --- | --- |
| D-01 | Usar Open-Meteo como fonte de dados, sem API key. | Viabiliza consultas de cidades e clima sem provisionar ou gerenciar credenciais de API. | Resolve a escolha do provedor em PA-09. Limites, licença, cobertura e condições de uso ainda precisam ser validados; ausência de chave não significa uso ilimitado. |
| D-02 | Considerar “cinco dias” como hoje e os quatro dias seguintes. | Elimina interpretações diferentes da janela e permite definir critérios de aceite consistentes. | Resolve PA-02 quanto à composição dos cinco dias. Não define o fuso de “hoje”, os indicadores nem o detalhamento diário ou por horário de PA-04. |
| D-03 | Usar Celsius como unidade padrão, mantendo a alternância para Fahrenheit. | Define uma apresentação inicial consistente sem remover a escolha prevista no briefing. | Resolve a unidade padrão de PA-06 e RF-04. Não define arredondamento nem retenção da preferência, ainda em PA-07. |
| D-04 | Não exigir autenticação nem usar persistência de servidor. | Reduz o escopo inicial ao dispensar contas e armazenamento persistente no servidor. | Resolve essas partes de PA-12. Não decide sobre armazenamento local, histórico, favoritos, cache ou uso offline de PA-07, PA-10 e PA-12. |
| D-05 | Usar pt-BR como idioma da interface. | Estabelece uma linguagem consistente para textos, controles e mensagens. | Resolve o idioma de PA-06. Formatos de datas e números ainda devem ser explicitados; não implica tradução dos nomes de cidades ou dos dados do provedor. |

## Suposições

As suposições a seguir são provisórias e precisam ser confirmadas antes de orientar
a especificação ou implementação:

- **S-01:** a primeira entrega será uma aplicação web responsiva, acessível em
  navegadores, sem necessidade de aplicativos nativos.
- **S-02:** a consulta será iniciada pela busca de uma cidade e exibirá uma
  localidade por vez; geolocalização não será presumida como requisito.
- **S-03:** histórico e favoritos não serão obrigatórios na primeira entrega,
  sujeitos à validação de PA-12. A ausência de autenticação e persistência de
  servidor deixou de ser suposição e foi confirmada em D-04.
- **S-04 (convertida em decisão):** pt-BR e Celsius foram confirmados em D-05 e
  D-03; não são mais hipóteses pendentes de aprovação.
- **S-05 (convertida em decisão):** Open-Meteo sem API key foi confirmada em D-01.
  A validação das condições de uso permanece pendente em PA-09.
- **S-06:** a consulta dependerá de acesso à internet; suporte offline não será
  considerado obrigatório sem decisão explícita.
- **S-07:** a previsão será informativa e não substituirá alertas oficiais nem
  garantirá condições futuras. Alertas de emergência não foram solicitados.

O próximo passo é validar as perguntas restantes com as partes interessadas e usar
as decisões confirmadas para produzir a especificação do produto, antes do plano
técnico e do código.