<#
  ENIGMA DIGITAL - NOCNI LANAC
  ---------------------------------------------------------------------------
  Pusta 5 Claude Code zadataka jedan za drugim, bez pitanja i bez odobrenja.
  Svaki korak pise svoj izvestaj u showcase\REPORT-0X.md, a poslednji korak
  pravi showcase\REPORT-FINAL.md - to je fajl koji citas ujutru.

  Pokretanje:
      powershell -ExecutionPolicy Bypass -File .\run-overnight.ps1

  Prekid: Ctrl+C. Vec zavrseni koraci ostaju zavrseni.

  NAPOMENA: ovaj fajl je namerno pisan bez kvacica i bez specijalnih crtica.
  Windows PowerShell 5.1 cita .ps1 kao ANSI, pa bi UTF-8 znakovi razbili parser.
#>

# NAMERNO nije "Stop": kad native komanda pise na stderr uz 2>&1, PowerShell 5.1
# to pretvara u terminating error i ubije ceo skript. Greske hvatamo preko exit koda.
$ErrorActionPreference = "Continue"

$ProjectRoot = "C:\Users\admin\Desktop\Web Dev Projects\enigma-digital"
$PromptDir   = Join-Path $ProjectRoot "showcase\prompts"
$LogDir      = Join-Path $ProjectRoot "showcase\logs"
$Stamp       = Get-Date -Format "yyyyMMdd_HHmmss"

$Steps = @(
    @{ Id="01"; File="01-capture.md";     Model="claude-opus-5";   Effort="high";   Label="Popravke capture-a + snimanje svih projekata" },
    @{ Id="02"; File="02-encode.md";      Model="claude-sonnet-5"; Effort="medium"; Label="Enkodiranje u mp4/webm + poster" },
    @{ Id="03"; File="03-content.md";     Model="claude-opus-5";   Effort="high";   Label="Pravi podaci + izbacivanje izmisljenog sadrzaja" },
    @{ Id="04"; File="04-integracija.md"; Model="claude-opus-5";   Effort="high";   Label="ShowcaseVideo komponenta + ugradnja u kartice" },
    @{ Id="05"; File="05-review.md";      Model="claude-fable-5";  Effort="xhigh";  Label="Review, vizuelna verifikacija, commit" }
)

# ---------------------------------------------------------------------------
# Priprema
# ---------------------------------------------------------------------------

if (-not (Test-Path $ProjectRoot)) {
    Write-Host "GRESKA: ne postoji $ProjectRoot" -ForegroundColor Red
    exit 1
}
Set-Location $ProjectRoot
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Host "GRESKA: komanda 'claude' nije u PATH-u." -ForegroundColor Red
    Write-Host "Otvori novi terminal ili proveri instalaciju Claude Code-a." -ForegroundColor Red
    exit 1
}

foreach ($s in $Steps) {
    $p = Join-Path $PromptDir $s.File
    if (-not (Test-Path $p)) {
        Write-Host "GRESKA: nedostaje prompt fajl $p" -ForegroundColor Red
        exit 1
    }
}

# Timeouts. Capture jednog sajta traje po nekoliko minuta - podrazumevana granica
# od 2 minuta za bash komandu bi ga ubila usred posla.
$env:BASH_DEFAULT_TIMEOUT_MS              = "1800000"   # 30 min
$env:BASH_MAX_TIMEOUT_MS                  = "2700000"   # 45 min
$env:API_TIMEOUT_MS                       = "1800000"   # 30 min
$env:CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS = "1800000"   # 30 min

# Ne daj Windowsu da zaspi usred noci i prekine lanac.
$SleepBlocked = $false
try {
    if (-not ("Win32.Power" -as [type])) {
        Add-Type -Name Power -Namespace Win32 -MemberDefinition @'
[DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
public static extern uint SetThreadExecutionState(uint esFlags);
'@
    }
    # ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED
    [Win32.Power]::SetThreadExecutionState([uint32]2147483648 -bor 1 -bor 64) | Out-Null
    $SleepBlocked = $true
} catch {
    $SleepBlocked = $false
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host " ENIGMA DIGITAL - nocni lanac" -ForegroundColor Cyan
Write-Host " Start:   $(Get-Date -Format 'dd.MM.yyyy HH:mm:ss')"
Write-Host " Repo:    $ProjectRoot"
Write-Host " Logovi:  $LogDir"
if ($SleepBlocked) {
    Write-Host " Spavanje racunara: blokirano dok lanac radi"
} else {
    Write-Host " Spavanje racunara: NIJE blokirano, proveri power settings" -ForegroundColor Yellow
}
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# Preflight - proveri da flagovi rade PRE nego sto potrosimo noc
# ---------------------------------------------------------------------------

$PreflightLog = Join-Path $LogDir "preflight_$Stamp.log"
Write-Host "[preflight] provera claude CLI flagova..." -ForegroundColor DarkGray

& claude -p "Odgovori tacno jednom recju: OK" --model claude-sonnet-5 --effort low --permission-mode bypassPermissions *> $PreflightLog
$PreflightCode = $LASTEXITCODE

if ($PreflightCode -ne 0) {
    Write-Host ""
    Write-Host "PREFLIGHT PAO (exit $PreflightCode). Lanac nije pokrenut." -ForegroundColor Red
    Write-Host "Log: $PreflightLog" -ForegroundColor Red
    Write-Host ""
    Write-Host "Najcesci uzrok: verzija Claude Code-a ne podrzava --effort ili --permission-mode." -ForegroundColor Yellow
    Write-Host "Probaj rucno ovo pa mi javi sta ispise:" -ForegroundColor Yellow
    Write-Host '   claude -p "OK" --permission-mode bypassPermissions' -ForegroundColor Yellow
    exit 1
}

Write-Host "[preflight] OK" -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------------------------
# Lanac
# ---------------------------------------------------------------------------

$Results   = @()
$ChainDead = $false
$RunStart  = Get-Date

foreach ($Step in $Steps) {

    $IsLast = ($Step.Id -eq "05")

    # Korak 05 (review + izvestaj) se pusta UVEK, i kad je lanac pukao ranije,
    # da ujutru ipak postoji izvestaj o tome sta se desilo.
    if ($ChainDead -and -not $IsLast) {
        Write-Host "[$($Step.Id)] PRESKOCENO - raniji korak je pao" -ForegroundColor DarkYellow
        $Results += [pscustomobject]@{
            Korak = $Step.Id; Naziv = $Step.Label; Status = "PRESKOCENO"; Trajanje = "-"; Log = "-"
        }
        continue
    }

    $PromptPath = Join-Path $PromptDir $Step.File
    # -Encoding UTF8 je obavezno: promptovi su na srpskom sa kvacicama, a PS 5.1
    # bi ih bez ovoga procitao kao ANSI i poslao modelu izlomljen tekst.
    $Prompt    = Get-Content $PromptPath -Raw -Encoding UTF8
    $LogPath   = Join-Path $LogDir ("{0}_{1}.log" -f $Step.Id, $Stamp)
    $StepStart = Get-Date

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
            Write-Host ""
            Write-Host "[$($Step.Id)] pao (exit $ExitCode), jedan ponovni pokusaj" -ForegroundColor Yellow
            $LogPath = Join-Path $LogDir ("{0}_{1}_retry.log" -f $Step.Id, $Stamp)
        }

        & claude -p $Prompt --model $Step.Model --effort $Step.Effort --permission-mode bypassPermissions 2>&1 | Tee-Object -FilePath $LogPath

        $ExitCode = $LASTEXITCODE
        $Attempt++
    }

    $Dur = "{0:hh\:mm\:ss}" -f ((Get-Date) - $StepStart)

    if ($ExitCode -eq 0) {
        Write-Host ""
        Write-Host "[$($Step.Id)] GOTOVO za $Dur" -ForegroundColor Green
        $Status = "OK"
    } else {
        Write-Host ""
        Write-Host "[$($Step.Id)] PAO (exit $ExitCode) posle $Dur" -ForegroundColor Red
        $Status = "PAO ($ExitCode)"
        if (-not $IsLast) { $ChainDead = $true }
    }

    $Results += [pscustomobject]@{
        Korak    = $Step.Id
        Naziv    = $Step.Label
        Status   = $Status
        Trajanje = $Dur
        Log      = Split-Path $LogPath -Leaf
    }

    Write-Host ""
}

# ---------------------------------------------------------------------------
# Sumarno
# ---------------------------------------------------------------------------

$TotalDur = "{0:hh\:mm\:ss}" -f ((Get-Date) - $RunStart)

Write-Host "==========================================================="
Write-Host " ZAVRSENO. Ukupno trajanje: $TotalDur" -ForegroundColor Cyan
Write-Host "==========================================================="
$Results | Format-Table -AutoSize

$SummaryPath = Join-Path $LogDir ("SUMMARY_{0}.txt" -f $Stamp)

$Summary = @()
$Summary += "Enigma Digital - nocni lanac"
$Summary += ("Start: {0}   Kraj: {1}   Ukupno: {2}" -f $RunStart.ToString('dd.MM.yyyy HH:mm:ss'), (Get-Date -Format 'dd.MM.yyyy HH:mm:ss'), $TotalDur)
$Summary += ""
$Summary += ($Results | Format-Table -AutoSize | Out-String)
$Summary += ""
$Summary += "Izvestaji:     showcase\REPORT-01.md ... REPORT-04.md i showcase\REPORT-FINAL.md"
$Summary += "Screenshotovi: showcase\review\"
$Summary += "Grana:         feat/project-showcase (nije push-ovana)"
$Summary | Set-Content -Path $SummaryPath -Encoding UTF8

Write-Host ""
Write-Host "PROCITAJ UJUTRU:" -ForegroundColor Yellow
Write-Host "   showcase\REPORT-FINAL.md   (glavni izvestaj)"
Write-Host "   showcase\review\           (screenshotovi u obe teme i oba jezika)"
Write-Host "   $SummaryPath"
Write-Host ""

# Vrati normalno ponasanje spavanja
try { [Win32.Power]::SetThreadExecutionState([uint32]2147483648) | Out-Null } catch {}

$Failed = @($Results | Where-Object { $_.Status -ne "OK" })
if ($Failed.Count -gt 0) { exit 1 } else { exit 0 }
