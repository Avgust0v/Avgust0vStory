# AvgustovStory 1.3.0 (25.11.2026): перенос карты и личных данных из старой версии сборки в новую.
# Запускается файлом "Perenos-karty.bat" из папки игры новой версии. Карта FTB Chunks (с метками), список серверов,
# закладки JEI и скриншоты хранятся у каждого игрока в папке экземпляра, а не на сервере, поэтому новая версия,
# поставленная отдельным экземпляром, начинается с пустой картой. Старая папка не меняется. Если в новой версии уже
# есть своя карта, файлы объединяются: из двух одноимённых остаётся более свежий, а прежняя карта новой версии
# сохраняется в local\ftbchunks.backup-<дата>.
# Для проверки без окон: -OldDir <папка> -NewDir <папка> -NoGui
param([string]$OldDir, [string]$NewDir, [switch]$NoGui)

$ErrorActionPreference = 'Stop'
if (-not $NoGui) { Add-Type -AssemblyName System.Windows.Forms }

function Say([string]$text, [string]$kind = 'Information') {
  if ($NoGui) { Write-Output $text; return }
  [void][System.Windows.Forms.MessageBox]::Show($text, 'AvgustovStory: перенос карты', 'OK', $kind)
}
function Ask([string]$text) {
  if ($NoGui) { return $true }
  return [System.Windows.Forms.MessageBox]::Show($text, 'AvgustovStory: перенос карты', 'OKCancel', 'Question') -eq 'OK'
}
# Папка игры: та, где лежат mods и config. Лаунчеры вроде Prism держат её внутри экземпляра (.minecraft или minecraft).
function Find-GameDir([string]$dir) {
  if (-not $dir -or -not (Test-Path -LiteralPath $dir)) { return $null }
  foreach ($c in @($dir, (Join-Path $dir '.minecraft'), (Join-Path $dir 'minecraft'))) {
    if ((Test-Path -LiteralPath (Join-Path $c 'mods')) -and (Test-Path -LiteralPath (Join-Path $c 'config'))) { return (Resolve-Path -LiteralPath $c).Path }
  }
  return $null
}
# Копирует дерево папок, не трогая источник: новых файлов кладёт все, одноимённые заменяет, только если в источнике свежее.
function Merge-Tree([string]$from, [string]$to) {
  $n = 0
  if (-not (Test-Path -LiteralPath $from)) { return 0 }
  foreach ($f in Get-ChildItem -LiteralPath $from -Recurse -File) {
    $rel = $f.FullName.Substring($from.Length).TrimStart('\')
    $dst = Join-Path $to $rel
    if ((Test-Path -LiteralPath $dst) -and ((Get-Item -LiteralPath $dst).LastWriteTimeUtc -ge $f.LastWriteTimeUtc)) { continue }
    $parent = Split-Path -Parent $dst
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item -LiteralPath $f.FullName -Destination $dst -Force
    $n++
  }
  return $n
}

try {
  if (-not $NewDir) { $NewDir = Split-Path -Parent $PSScriptRoot }
  $new = Find-GameDir $NewDir
  if (-not $new) { Say "Не нашёл папку игры новой версии рядом со скриптом:`n$NewDir`n`nЗапустите Perenos-karty.bat из папки игры новой версии (там, где папки mods и config)." 'Error'; exit 1 }

  if (-not (Ask "Скрипт перенесёт из старой версии сборки в эту:`n`n- карту FTB Chunks вместе с метками;`n- список серверов;`n- закладки JEI;`n- скриншоты.`n`nСтарая папка не изменится. Перед продолжением закройте игру — обе версии.`n`nДальше выберите папку старой версии.")) { exit 0 }

  if (-not $OldDir) {
    $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
    $dlg.Description = 'Папка СТАРОЙ версии AvgustovStory (в ней есть папки mods и config)'
    $dlg.SelectedPath = Split-Path -Parent $new
    if ($dlg.ShowDialog() -ne 'OK') { exit 0 }
    $OldDir = $dlg.SelectedPath
  }
  $old = Find-GameDir $OldDir
  if (-not $old) { Say "В выбранной папке нет папок mods и config:`n$OldDir`n`nВыберите папку старой версии сборки." 'Error'; exit 1 }
  if ($old -eq $new) { Say 'Выбрана та же папка, что и у новой версии. Выберите папку старой версии.' 'Error'; exit 1 }

  $report = @()
  # 1. Карта FTB Chunks и метки
  $oldMap = Join-Path $old 'local\ftbchunks'; $newMap = Join-Path $new 'local\ftbchunks'
  if (Test-Path -LiteralPath $oldMap) {
    if (Test-Path -LiteralPath $newMap) {
      $bak = "$newMap.backup-" + (Get-Date -Format 'yyyy-MM-dd_HH-mm')
      Copy-Item -LiteralPath $newMap -Destination $bak -Recurse -Force
      $report += "Прежняя карта этой версии сохранена: local\" + (Split-Path -Leaf $bak)
    }
    $report += "Карта и метки FTB Chunks: файлов перенесено — " + (Merge-Tree $oldMap $newMap)
  } else { $report += 'Карта FTB Chunks: в старой версии её нет.' }
  # 2. Список серверов
  $oldSrv = Join-Path $old 'servers.dat'; $newSrv = Join-Path $new 'servers.dat'
  if (Test-Path -LiteralPath $oldSrv) {
    if (Test-Path -LiteralPath $newSrv) { Copy-Item -LiteralPath $newSrv -Destination "$newSrv.bak" -Force }
    Copy-Item -LiteralPath $oldSrv -Destination $newSrv -Force
    $report += 'Список серверов перенесён' + $(if (Test-Path -LiteralPath "$newSrv.bak") { ' (прежний — servers.dat.bak).' } else { '.' })
  }
  # 3. Закладки JEI (общие и по мирам)
  $oldJei = Join-Path $old 'config\jei'; $newJei = Join-Path $new 'config\jei'
  # только закладки: настройки JEI новой версии (jei-client.ini и др.) не трогаем
  $j = 0
  $ob = Join-Path $oldJei 'bookmarks.ini'; $nb = Join-Path $newJei 'bookmarks.ini'
  if ((Test-Path -LiteralPath $ob) -and (-not (Test-Path -LiteralPath $nb) -or (Get-Item -LiteralPath $nb).LastWriteTimeUtc -lt (Get-Item -LiteralPath $ob).LastWriteTimeUtc)) {
    if (-not (Test-Path -LiteralPath $newJei)) { New-Item -ItemType Directory -Path $newJei -Force | Out-Null }
    Copy-Item -LiteralPath $ob -Destination $nb -Force; $j++
  }
  $j += Merge-Tree (Join-Path $oldJei 'world') (Join-Path $newJei 'world')
  if ($j -gt 0) { $report += "Закладки JEI: файлов перенесено — $j" }
  # 4. Скриншоты
  $s = Merge-Tree (Join-Path $old 'screenshots') (Join-Path $new 'screenshots')
  if ($s -gt 0) { $report += "Скриншоты: перенесено — $s" }

  Say ("Готово.`n`n" + ($report -join "`n") + "`n`nМожно запускать игру.")
} catch {
  Say ("Перенос прервался с ошибкой:`n" + $_.Exception.Message + "`n`nСтарая папка не тронута.") 'Error'
  exit 1
}
