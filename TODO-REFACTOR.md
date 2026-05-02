# TODO: Reorganizar componentes src/containers/with Clean Code

## Objetivo

Reorganizar os componentes `src/containers/` com conceito de clean code, movendo shimmer inline para CSS global e organizando componentes em subpastas.

---

## Estrutura Atual

```
src/components/start/
├── components/
│   ├── ActionButtons.tsx
│   ├── ActionButtonsSkeleton.tsx
│   ├── ActionIconButton.tsx
│   ├── BioSection.tsx
│   ├── BioSectionSkeleton.tsx
│   ├── Header.tsx
│   ├── HeaderSkeleton.tsx
│   ├── index.ts
│   ├── ProfileImage.tsx
│   ├── ProfileImageSkeleton.tsx
│   ├── SocialButton.tsx
│   ├── StatCard.tsx
│   ├── StatCardSkeleton.tsx
│   └── StatsGrid.tsx
├── page.tsx
└── start.module.css
```

## Estrutura Proposta (Clean Code)

```
src/components/start/
├── components/
│   ├── index.ts                    # Exports centralizados
│   │
│   ├── profile/                     # Componentes do perfil
│   │   ├── ProfileImage.tsx
│   │   ├── ProfileImageSkeleton.tsx
│   │   └── index.ts
│   │
│   ├── header/                      # Componentes do cabeçalho
│   │   ├── Header.tsx
│   │   ├── HeaderSkeleton.tsx
│   │   └── index.ts
│   │
│   ├── bio/                        # Componentes da biografia
│   │   ├── BioSection.tsx
│   │   ├── BioSectionSkeleton.tsx
│   │   └── index.ts
│   │
│   ├── stats/                      # Componentes de estatísticas
│   │   ├── StatCard.tsx
│   │   ├── StatCardSkeleton.tsx
│   │   ├── StatsGrid.tsx
│   │   └── index.ts
│   │
│   └── actions/                    # Componentes de ações
│       ├── ActionButtons.tsx
│       ├── ActionButtonsSkeleton.tsx
│       ├── ActionIconButton.tsx
│       ├── SocialButton.tsx
│       └── index.ts
│
├── page.tsx                        # Componente principal
├── start.module.css                # Remover shimmer (mover para globals.css)
└── index.ts                        # Exports do módulo start
```

---

## Plano de Execução

### Fase 1: Mover Shimmer para CSS Global

- [ ] Mover `@keyframes shimmer` de `start.module.css` e `page.tsx` para `globals.css`
- [ ] Remover `const shimmerStyle` inline de `page.tsx`
- [ ] Limpar `start.module.css` (manter apenas animações não-globais)

### Fase 2: Reorganizar subpastas

- [ ] Criar subpastas: `profile/`, `header/`, `bio/`, `stats/`, `actions/`
- [ ] Mover arquivos para respectivas subpastas
- [ ] Criar `index.ts` em cada subpasta com exports

### Fase 3: Atualizar imports

- [ ] Atualizar `page.tsx` com novos paths de import
- [ ] Atualizar `components/index.ts` principal
- [ ] Verificar imports em outros arquivos

### Fase 4: Limpar código

- [ ] Remover `suppressHydrationWarning` desnecessário
- [ ] Consolidar CSS duplicado
- [ ] Verificar build

### Fase 5: Opcional - Adicionar MagicUI

- [ ] Instalar componentes MagicUI desejados
- [ ] Integrar animações (se aplicável)

---

## Comandos de Build/Teste

```bash
cd /root/ && pnpm build
```

---

## Notas

- Manter compatibilidade com shadcn/ui existente
- Preservar animações neon existentes
- Garantir que build passe sem erros
