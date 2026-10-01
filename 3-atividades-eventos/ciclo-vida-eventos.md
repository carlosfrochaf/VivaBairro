# Ciclo de Vida de Eventos

A área de **Atividades e Eventos** é o coração da convivência comunitária no VivaBairro, reunindo encontros culturais, mutirões, feiras, esportes e assembleias.

---

## 📝 Campos da Publicação de Evento

Ao cadastrar uma atividade, o organizador preenche os dados necessários:

| Campo | Tipo | Obrigatório? | Descrição |
| :--- | :--- | :--- | :--- |
| **Título** | Texto | Sim | Nome da atividade (ex: *Oficina de Horta Urbana*). |
| **Descrição & Objetivo** | Texto longo | Sim | Explicação detalhada do que acontecerá e por que foi organizada. |
| **Data & Horários** | Data / Hora | Sim | Início e término da atividade. |
| **Bairro & Local** | Seleção / Texto | Sim | Ponto de referência e orientações de acesso. |
| **Limite de Vagas** | Numérico | Não | Quantidade máxima de participantes (se aplicável). |
| **Custo / Taxa** | Valor / Gratuito | Não | Gratuito por padrão; valor opcional para custeio de materiais. |
| **Materiais Necessários**| Texto | Não | O que o participante deve levar (ex: *luvas, água, caderno*). |
| **Contato do Organizador**| Texto / Link | Sim | Canal para dúvidas (WhatsApp, e-mail ou perfil). |

---

## 🔄 Estados e Ciclo de Vida da Atividade

```
 [Planejamento/Criado] ──► [Inscrições Abertas] ──► [Lotado (Opcional)]
                                  │                         │
                                  ▼                         ▼
                            [Em Realização]           [Cancelado]
                                  │
                                  ▼
                        [Encerrado / Arquivado]
```

* **Ativo / Próximos Eventos:** Exibido no feed principal do bairro até a data/hora de término.
* **Lotado:** Disparado automaticamente ao atingir o limite de vagas; bloqueia novas confirmações.
* **Cancelado:** Avisa instantaneamente a todos os inscritos com o motivo.
* **Arquivado:** Após o término, o evento sai da página inicial e fica preservado no histórico do organizador e dos participantes.
