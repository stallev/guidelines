# Next.js Code Guidelines Index

Этот каталог содержит guidelines для Next.js.  
`README.md` является единственной точкой внутренней навигации между документами.

## Scope

- Основа: App Router и подходы актуальной stable-версии Next.js.
- Источники норм: официальная документация Next.js и релевантная platform-документация.
- Внутри guideline-файлов не должно быть ссылок на другие guideline-файлы этого каталога.

## Active Guidelines (reusable)

- [ai_admin_interface_requirements.md](./ai_admin_interface_requirements.md)
- [ai_bundle_analyze_steps.md](./ai_bundle_analyze_steps.md)
- [ai_chunk_analysis_and_page_load_optimization.md](./ai_chunk_analysis_and_page_load_optimization.md)
- [ai_drag_drop_guidelines.md](./ai_drag_drop_guidelines.md)
- [ai_ga4_and_consent_guidelines.md](./ai_ga4_and_consent_guidelines.md)
- [ai_loading_patterns.md](./ai_loading_patterns.md)
- [ai_nextjs_db_data_handle.md](./ai_nextjs_db_data_handle.md)
- [ai_public_pages_optimization.md](./ai_public_pages_optimization.md)
- [ai_responsive_table_guidelines.md](./ai_responsive_table_guidelines.md)
- [ai_vercel_runtime_compatibility.md](./ai_vercel_runtime_compatibility.md)
- [ai_zustand_store_nextjs_guideline.md](./ai_zustand_store_nextjs_guideline.md)
- [parallel_routes_guidelines.md](./parallel_routes_guidelines.md)

## Platform / Project-specific (legacy or migration)

Эти документы не являются универсальным baseline и могут использоваться только как исторический или миграционный контекст:

- [ai_aws_amplify_compatibility.md](./ai_aws_amplify_compatibility.md)
- [ai_isr_optimization_guidelines.md](./ai_isr_optimization_guidelines.md)
- [ai_server_actions_guidelines.md](./ai_server_actions_guidelines.md)
- [local_web_app.md](./local_web_app.md)
- [master_architecture_guideline.md](./master_architecture_guideline.md)
- [performance_guidelines.md](./performance_guidelines.md)
- [START_FULLSTACK_PROJECT_PROMPT.md](./START_FULLSTACK_PROJECT_PROMPT.md)

## Usage Order

1. Runtime/policy: `ai_vercel_runtime_compatibility.md`
2. Data and mutations: `ai_nextjs_db_data_handle.md`
3. Loading/streaming UX: `ai_loading_patterns.md`
4. Performance: `ai_bundle_analyze_steps.md` + `ai_chunk_analysis_and_page_load_optimization.md`
5. Public pages: `ai_public_pages_optimization.md`

## Maintenance Rules

- Проверять все рекомендации на соответствие текущей stable-версии Next.js.
- Не фиксировать hardcoded лимиты платформы в тексте; ссылаться на официальную страницу лимитов.
- Любые новые guideline-файлы добавлять в этот индекс, а не связывать напрямую между собой.
