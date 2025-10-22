# Подключение к удаленному репозиторию через Cursor

## Обзор
Данная инструкция описывает процесс настройки подключения к удаленному GitHub репозиторию через терминал Cursor с использованием SSH-ключей.

## Предварительные требования
- Установленный Git
- Аккаунт на GitHub
- SSH-ключ (приватный и публичный)

## Шаг 1: Проверка текущего состояния

### Проверить удаленные репозитории:
```powershell
git remote -v
```

### Проверить статус репозитория:
```powershell
git status
```

### Проверить SSH-ключи:
```powershell
ls ~/.ssh
```

## Шаг 2: Настройка SSH-ключей

### Проверить подключение к GitHub:
```powershell
ssh -i ~/.ssh/ваш_ключ -T git@github.com
```

### Настроить Git для использования SSH-ключа:
```powershell
git config --global core.sshCommand "ssh -i ~/.ssh/ваш_ключ"
```

## Шаг 3: Настройка upstream ветки

### Если upstream не настроен:
```powershell
git fetch origin
git branch --set-upstream-to=origin/master master
```

### Или при первом push:
```powershell
git push -u origin master
```

## Шаг 4: Основные команды для работы

### Добавить изменения:
```powershell
git add .
# или для конкретного файла:
git add имя_файла
```

### Создать коммит:
```powershell
git commit -m "Описание изменений"
```

### Отправить в удаленный репозиторий:
```powershell
git push
```

### Получить изменения из удаленного репозитория:
```powershell
git pull
```

## Шаг 5: Проверка работы

### Проверить статус:
```powershell
git status
```

### Посмотреть историю коммитов:
```powershell
git log --oneline
```

### Проверить подключение к GitHub:
```powershell
ssh -i ~/.ssh/ваш_ключ -T git@github.com
```

## Решение проблем

### Проблема: "Permission denied (publickey)"
**Решение:**
1. Убедитесь, что SSH-ключ существует: `ls ~/.ssh`
2. Проверьте права доступа к ключу: `chmod 600 ~/.ssh/ваш_ключ`
3. Добавьте ключ в SSH-агент: `ssh-add ~/.ssh/ваш_ключ`

### Проблема: "upstream is gone"
**Решение:**
```powershell
git branch --unset-upstream
git push -u origin master
```

### Проблема: SSH-агент не работает в PowerShell
**Решение:**
1. Используйте Git Bash вместо PowerShell
2. Или используйте прямой путь к ключу: `ssh -i ~/.ssh/ваш_ключ`

## Альтернативные способы

### Использование Git Bash:
```bash
# Запустить SSH-агент
eval "$(ssh-agent -s)"

# Добавить ключ
ssh-add ~/.ssh/ваш_ключ

# Проверить подключение
ssh -T git@github.com
```

### Использование HTTPS вместо SSH:
```powershell
git remote set-url origin https://github.com/username/repository.git
```

## Полезные команды

### Просмотр конфигурации Git:
```powershell
git config --list
```

### Изменение удаленного репозитория:
```powershell
git remote set-url origin git@github.com:username/repository.git
```

### Клонирование репозитория:
```powershell
git clone git@github.com:username/repository.git
```

## PowerShell скрипт для автоматического подключения

### Полный скрипт подключения к репозиторию:

```powershell
# Функция для настройки подключения к GitHub репозиторию
function Connect-GitHubRepository {
    param(
        [Parameter(Mandatory=$true)]
        [string]$SSHKeyPath,
        
        [Parameter(Mandatory=$false)]
        [string]$RepositoryUrl = "git@github.com:stallev/guidelines.git"
    )
    
    Write-Host "🔧 Настройка подключения к GitHub репозиторию..." -ForegroundColor Yellow
    
    # Проверка существования SSH-ключа
    if (-not (Test-Path $SSHKeyPath)) {
        Write-Error "SSH-ключ не найден: $SSHKeyPath"
        return
    }
    
    # Проверка подключения к GitHub
    Write-Host "🔍 Проверка SSH-подключения к GitHub..." -ForegroundColor Cyan
    $sshTest = ssh -i $SSHKeyPath -T git@github.com 2>&1
    if ($LASTEXITCODE -eq 0 -or $sshTest -match "successfully authenticated") {
        Write-Host "✅ SSH-подключение к GitHub работает!" -ForegroundColor Green
    } else {
        Write-Error "❌ SSH-подключение к GitHub не работает: $sshTest"
        return
    }
    
    # Настройка Git для использования SSH-ключа
    Write-Host "⚙️ Настройка Git конфигурации..." -ForegroundColor Cyan
    git config --global core.sshCommand "ssh -i $SSHKeyPath"
    
    # Проверка удаленного репозитория
    Write-Host "🔗 Проверка удаленного репозитория..." -ForegroundColor Cyan
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl -ne $RepositoryUrl) {
        Write-Host "📝 Настройка URL удаленного репозитория..." -ForegroundColor Yellow
        git remote set-url origin $RepositoryUrl
    }
    
    # Получение изменений из удаленного репозитория
    Write-Host "📥 Получение изменений из удаленного репозитория..." -ForegroundColor Cyan
    git fetch origin
    
    # Настройка upstream ветки
    Write-Host "🔗 Настройка upstream ветки..." -ForegroundColor Cyan
    $currentBranch = git branch --show-current
    git branch --set-upstream-to=origin/$currentBranch $currentBranch 2>$null
    
    # Проверка статуса
    Write-Host "📊 Проверка статуса репозитория..." -ForegroundColor Cyan
    git status
    
    Write-Host "🎉 Подключение к репозиторию настроено успешно!" -ForegroundColor Green
    Write-Host "💡 Теперь вы можете использовать: git push, git pull, git add, git commit" -ForegroundColor Blue
}

# Функция для быстрой проверки подключения
function Test-GitHubConnection {
    param(
        [Parameter(Mandatory=$true)]
        [string]$SSHKeyPath
    )
    
    Write-Host "🔍 Проверка подключения к GitHub..." -ForegroundColor Cyan
    $result = ssh -i $SSHKeyPath -T git@github.com 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match "successfully authenticated") {
        Write-Host "✅ Подключение к GitHub работает!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Подключение к GitHub не работает: $result" -ForegroundColor Red
        return $false
    }
}

# Функция для выполнения полного workflow
function Invoke-GitWorkflow {
    param(
        [Parameter(Mandatory=$false)]
        [string]$CommitMessage = "Update from Cursor",
        
        [Parameter(Mandatory=$false)]
        [string]$SSHKeyPath = "~/.ssh/user"
    )
    
    Write-Host "🚀 Выполнение Git workflow..." -ForegroundColor Yellow
    
    # Проверка подключения
    if (-not (Test-GitHubConnection -SSHKeyPath $SSHKeyPath)) {
        Write-Error "Не удается подключиться к GitHub"
        return
    }
    
    # Добавление всех изменений
    Write-Host "📝 Добавление изменений..." -ForegroundColor Cyan
    git add .
    
    # Создание коммита
    Write-Host "💾 Создание коммита..." -ForegroundColor Cyan
    git commit -m $CommitMessage
    
    # Отправка в удаленный репозиторий
    Write-Host "📤 Отправка в удаленный репозиторий..." -ForegroundColor Cyan
    git push
    
    Write-Host "✅ Workflow выполнен успешно!" -ForegroundColor Green
}

# Примеры использования:

# 1. Настройка подключения к репозиторию
# Connect-GitHubRepository -SSHKeyPath "~/.ssh/user"

# 2. Проверка подключения
# Test-GitHubConnection -SSHKeyPath "~/.ssh/user"

# 3. Выполнение полного workflow (add, commit, push)
# Invoke-GitWorkflow -CommitMessage "Мои изменения" -SSHKeyPath "~/.ssh/user"
```

### Быстрые команды для ежедневного использования:

```powershell
# Настройка подключения (выполнить один раз)
Connect-GitHubRepository -SSHKeyPath "~/.ssh/user"

# Ежедневная работа - добавить, закоммитить и отправить
Invoke-GitWorkflow -CommitMessage "Описание изменений"

# Проверить статус
git status

# Посмотреть историю
git log --oneline -5
```

### Команды для решения проблем:

```powershell
# Если SSH не работает, проверить ключ
ssh -i ~/.ssh/user -T git@github.com

# Если upstream сломан
git branch --unset-upstream
git push -u origin master

# Если нужно изменить SSH-ключ
git config --global core.sshCommand "ssh -i ~/.ssh/новый_ключ"
```

## Заключение

После выполнения всех шагов вы сможете:
- Делать push в удаленный репозиторий
- Получать изменения через pull
- Работать с ветками
- Синхронизировать локальную и удаленную версии

Все команды выполняются в терминале Cursor без необходимости использования внешних инструментов.
