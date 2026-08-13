<#
  ENIGMA DIGITAL - NOCNI LANAC: KRUG 2 (round 2)
  ---------------------------------------------------------------------------
  Pusta 12 Claude Code zadataka jedan za drugim, bez pitanja i bez odobrenja.
  Radi LOKALNO na grani feat/redesign-round2 (od feat/redesign-clean).
  NISTA se ne push-uje i ne deploy-uje.
  Svaki korak pise showcase\redesign-round2\REPORT-0X.md; poslednji REPORT-FINAL.md.

  Pokretanje:
      powershell -ExecutionPolicy Bypass -File .\run-round2-overnight.ps1

  Prekid: Ctrl+C. Vec zavrseni koraci (i lokalni commit-ovi) ostaju.
  Fajl je namerno bez kvacica i specijalnih crtica (PS 5.1 cita .ps1 kao ANSI).
#>

$ErrorActionPreference = "Continue"

# Prompt ide preko STDIN (ne kao argument): PS 5.1 ne cepka tekst na navodnicima,
# pa tokeni tipa "-A" iz "git add -A" ne zavrse kao CLI opcije. UTF8 bez BOM za srpska slova.
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
$RunInstr = "Procitaj i izvrsi do kraja zadatak i sva pravila iz teksta koji stize preko stdin. Radi autonomno, ne trazi potvrdu."

$ProjectRoot = "C:\Users\admin\Desktop\Web Dev Projects\enigma-digital"
$PromptDir   = Join-Path $ProjectRoot "showcase\prompts"
$LogDir      = Join-Path $ProjectRoot "showcase\logs"
$Stamp       = Get-Date -Format "yyyyMMdd_HHmmss"

$Steps = @(
    @{ Id="01"; File="r2-01-rekon.md";              Model="claude-sonnet-5"; Effort="medium"; Label="Grana feat/redesign-round2 + priprema + plan" },
    @{ Id="02"; File="r2-02-cta-nav.md";            Model="claude-opus-5";   Effort="high";   Label="CTA lagani puls + ujednacen radius + nav/switcher + ghost" },
    @{ Id="03"; File="r2-03-logo-kocka.md";         Model="claude-opus-5";   Effort="high";   Label="Logo emblem = 3D kocka sa draw->fade loop-om" },
    @{ Id="04"; File="r2-04-redosled.md";           Model="claude-sonnet-5"; Effort="medium"; Label="Redosled pocetne: Timeline pa Disciplines pa TechSection" },
    @{ Id="05"; File="r2-05-discipline-slajder.md"; Model="claude-opus-5";   Effort="xhigh";  Label="Discipline -> beskonacan slajder + scroll/tooltip" },
    @{ Id="06"; File="r2-06-usluge-panel.md";       Model="claude-opus-5";   Effort="high";   Label="Cist slajd usluge (bez eyebrow/proof, capability na dnu)" },
    @{ Id="07"; File="r2-07-usluge-strelice.md";    Model="claude-opus-5";   Effort="high";   Label="Plave strelice bez bordera + hover iscrtavanje + scroll dots" },
    @{ Id="08"; File="r2-08-usluge-cta.md";         Model="claude-sonnet-5"; Effort="medium"; Label="Mala kontakt-CTA sekcija ispod FAQ-a" },
    @{ Id="09"; File="r2-09-kontakt.md";            Model="claude-opus-5";   Effort="high";   Label="Kontakt: glass forma, floating labels, interes-pilule, mejl" },
    @{ Id="10"; File="r2-10-projekti-capture.md";   Model="claude-sonnet-5"; Effort="high";   Label="Auto-capture mockup slika (4 velicine) + manifest" },
    @{ Id="11"; File="r2-11-projekti-mockapi.md";   Model="claude-opus-5";   Effort="xhigh";  Label="Projekti: device-mockup klaster po projektu" },
    @{ Id="12"; File="r2-12-review.md";             Model="claude-fable-5";  Effort="xhigh";  Label="Review + verifikacija + REPORT-FINAL (bez push)" }
)

$LastId = $Steps[-1].Id

if (-not (Test-Path $ProjectRoot)) { Write-Host "GRESKA: ne postoji $ProjectRoot" -ForegroundColor Red; exit 1 }
Set-Location $ProjectRoot
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Host "GRESKA: komanda 'claude' nije u PATH-u." -ForegroundColor Red; exit 1
}
foreach ($s in $Steps) {
    $p = Join-Path $PromptDir $s.File
    if (-not (Test-Path $p)) { Write-Host "GRESKA: nedostaje prompt fajl $p" -ForegroundColor Red; exit 1 }
}

$env:BASH_DEFAULT_TIMEOUT_MS              = "1800000"
$env:BASH_MAX_TIMEOUT_MS                  = "2700000"
$env:API_TIMEOUT_MS                       = "1800000"
$env:CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS = "1800000"

$SleepBlocked = $false
try {
    if (-not ("Win32.Power" -as [type])) {
        Add-Type -Name Power -Namespace Win32 -MemberDefinition @'
[DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
public static extern uint SetThreadExecutionState(uint esFlags);
'@
    }
    [Win32.Power]::SetThreadExecutionState([uint32]2147483648 -bor 1 -bor 64) | Out-Null
    $SleepBlocked = $true
} catch { $SleepBlocked = $false }

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host " ENIGMA DIGITAL - nocni lanac: KRUG 2" -ForegroundColor Cyan
Write-Host " Start:   $(Get-Date -Format 'dd.MM.yyyy HH:mm:ss')"
Write-Host " Repo:    $ProjectRoot"
Write-Host " Grana:   feat/redesign-round2 (od feat/redesign-clean, LOKALNO, bez push)"
Write-Host " Logovi:  $LogDir"
if ($SleepBlocked) { Write-Host " Spavanje racunara: blokirano dok lanac radi" }
else { Write-Host " Spavanje racunara: NIJE blokirano, proveri power settings" -ForegroundColor Yellow }
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$PreflightLog = Join-Path $LogDir "preflight_r2_$Stamp.log"
Write-Host "[preflight] provera claude CLI (stdin + flagovi)..." -ForegroundColor DarkGray
"Odgovori tacno jednom recju: OK" | & claude -p $RunInstr --model claude-sonnet-5 --effort low --permission-mode bypassPermissions *> $PreflightLog
$PreflightCode = $LASTEXITCODE
if ($PreflightCode -ne 0) {
    Write-Host "PREFLIGHT PAO (exit $PreflightCode). Lanac nije pokrenut." -ForegroundColor Red
    Write-Host "Log: $PreflightLog" -ForegroundColor Red
    exit 1
}
Write-Host "[preflight] OK" -ForegroundColor Green
Write-Host ""

$Results   = @()
$ChainDead = $false
$RunStart  = Get-Date

foreach ($Step in $Steps) {

    $IsLast = ($Step.Id -eq $LastId)

    if ($ChainDead -and -not $IsLast) {
        Write-Host "[$($Step.Id)] PRESKOCENO - raniji korak je pao" -ForegroundColor DarkYellow
        $Results += [pscustomobject]@{ Korak=$Step.Id; Naziv=$Step.Label; Status="PRESKOCENO"; Trajanje="-"; Log="-" }
        continue
    }

    $PromptPath = Join-Path $PromptDir $Step.File
    $Prompt     = Get-Content $PromptPath -Raw -Encoding UTF8
    $LogPath    = Join-Path $LogDir ("r2_{0}_{1}.log" -f $Step.Id, $Stamp)
    $StepStart  = Get-Date

    Write-Host "-----------------------------------------------------------"
    Write-Host "[$($Step.Id)] $($Step.Label)" -ForegroundColor Cyan
    Write-Host "      model: $($Step.Model)   effort: $($Step.Effort)"
    Write-Host "      start: $(Get-Date -Format 'HH:mm:ss')"
    Write-Host "      log:   $(Split-Path $LogPath -Leaf)"
    Write-Host ""

    $Attempt  = 1
    $ExitCode = 1
    while ($Attempt -le 2 -and $ExitCode -ne 0) {
        if ($Attempt -eq 2) {
            Write-Host "[$($Step.Id)] pao (exit $ExitCode), jedan ponovni pokusaj" -ForegroundColor Yellow
            $LogPath = Join-Path $LogDir ("r2_{0}_{1}_retry.log" -f $Step.Id, $Stamp)
        }
        $Prompt | & claude -p $RunInstr --model $Step.Model --effort $Step.Effort --permission-mode bypassPermissions 2>&1 | Tee-Object -FilePath $LogPath
        $ExitCode = $LASTEXITCODE
        $Attempt++
    }

    $Dur = "{0:hh\:mm\:ss}" -f ((Get-Date) - $StepStart)
    if ($ExitCode -eq 0) {
        Write-Host "[$($Step.Id)] GOTOVO za $Dur" -ForegroundColor Green
        $Status = "OK"
    } else {
        Write-Host "[$($Step.Id)] PAO (exit $ExitCode) posle $Dur" -ForegroundColor Red
        $Status = "PAO ($ExitCode)"
        if (-not $IsLast) { $ChainDead = $true }
    }

    $Results += [pscustomobject]@{ Korak=$Step.Id; Naziv=$Step.Label; Status=$Status; Trajanje=$Dur; Log=(Split-Path $LogPath -Leaf) }
    Write-Host ""
}

$TotalDur = "{0:hh\:mm\:ss}" -f ((Get-Date) - $RunStart)
Write-Host "==========================================================="
Write-Host " ZAVRSENO. Ukupno trajanje: $TotalDur" -ForegroundColor Cyan
Write-Host "==========================================================="
$Results | Format-Table -AutoSize

$SummaryPath = Join-Path $LogDir ("SUMMARY_r2_{0}.txt" -f $Stamp)
$Summary = @()
$Summary += "Enigma Digital - nocni lanac: KRUG 2"
$Summary += ("Start: {0}   Kraj: {1}   Ukupno: {2}" -f $RunStart.ToString('dd.MM.yyyy HH:mm:ss'), (Get-Date -Format 'dd.MM.yyyy HH:mm:ss'), $TotalDur)
$Summary += ""
$Summary += ($Results | Format-Table -AutoSize | Out-String)
$Summary += ""
$Summary += "Procitaj:      showcase\redesign-round2\REPORT-FINAL.md (glavni), REPORT-01..11.md"
$Summary += "Screenshotovi: showcase\redesign-round2\review\ (ako je Playwright bio dostupan)"
$Summary += "Grana:         feat/redesign-round2 (od feat/redesign-clean)  --  NIJE push-ovana, nista deploy-ovano"
$Summary += "Pregled:       git switch feat/redesign-round2  &&  npm run dev"
$Summary += "Vracanje:      git switch feat/redesign-clean   (round 1)   ili   git switch main"
$Summary | Set-Content -Path $SummaryPath -Encoding UTF8

Write-Host ""
Write-Host "PROCITAJ UJUTRU:" -ForegroundColor Yellow
Write-Host "   showcase\redesign-round2\REPORT-FINAL.md   (glavni izvestaj)"
Write-Host "   $SummaryPath"
Write-Host "   Grana feat/redesign-round2 (lokalno, bez push). Pregled: git switch feat/redesign-round2; npm run dev"
Write-Host ""

try { [Win32.Power]::SetThreadExecutionState([uint32]2147483648) | Out-Null } catch {}

$Failed = @($Results | Where-Object { $_.Status -ne "OK" -and $_.Status -ne "PRESKOCENO" })
if ($Failed.Count -gt 0) { exit 1 } else { exit 0 }
