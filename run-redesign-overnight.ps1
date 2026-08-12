<#
  ENIGMA DIGITAL - NOCNI LANAC: REDIZAJN (cistije + carousel + trace CTA)
  ---------------------------------------------------------------------------
  Pusta 7 Claude Code zadataka jedan za drugim, bez pitanja i bez odobrenja.
  Radi LOKALNO na grani feat/redesign-clean. NISTA se ne push-uje i ne deploy-uje.
  Svaki korak pise showcase\REPORT-0X.md; poslednji pravi showcase\REPORT-FINAL.md.

  Pokretanje:
      powershell -ExecutionPolicy Bypass -File .\run-redesign-overnight.ps1

  Prekid: Ctrl+C. Vec zavrseni koraci (i njihovi lokalni commit-ovi) ostaju.

  NAPOMENA: fajl je namerno bez kvacica i bez specijalnih crtica (PS 5.1 cita .ps1 kao ANSI).
#>

$ErrorActionPreference = "Continue"

# Prompt se salje preko STDIN (ne kao argument), pa PowerShell 5.1 ne cepka tekst
# na navodnicima i tokeni tipa "-A" iz "git add -A" ne zavrse kao CLI opcije.
# UTF8 (bez BOM) da srpska slova prodju kroz pipe citko.
$OutputEncoding = New-Object System.Text.UTF8Encoding $false

# Kratko, ASCII-safe uputstvo; pun prompt (sa svim pravilima) stize preko stdin.
$RunInstr = "Procitaj i izvrsi do kraja zadatak i sva pravila iz teksta koji stize preko stdin. Radi autonomno, ne trazi potvrdu."

$ProjectRoot = "C:\Users\admin\Desktop\Web Dev Projects\enigma-digital"
$PromptDir   = Join-Path $ProjectRoot "showcase\prompts"
$LogDir      = Join-Path $ProjectRoot "showcase\logs"
$Stamp       = Get-Date -Format "yyyyMMdd_HHmmss"

# Model tokeni i effort kao u tvom postojecem lancu (opus/fable, high/xhigh).
$Steps = @(
    @{ Id="01"; File="redesign-01-rekon.md";    Model="claude-sonnet-5"; Effort="medium"; Label="Rekon + grana feat/redesign-clean + plan sazimanja" },
    @{ Id="02"; File="redesign-02-cta.md";       Model="claude-opus-5";  Effort="high";  Label="Novo CTA dugme: Trace glass (A), stari stil zadrzan" },
    @{ Id="03"; File="redesign-03-card.md";      Model="claude-opus-5";  Effort="high";  Label="Card + RevealCard primitiv sa trace reveal" },
    @{ Id="04"; File="redesign-04-usluge.md";    Model="claude-opus-5";  Effort="xhigh"; Label="Usluge: kompaktan panel + beskonacan carousel" },
    @{ Id="05"; File="redesign-05-faq.md";       Model="claude-sonnet-5"; Effort="medium"; Label="FAQ redizajn (kompaktno, u sistemu)" },
    @{ Id="06"; File="redesign-06-projekti.md";  Model="claude-opus-5";  Effort="high";  Label="Projekti: mirniji hero + sazimanje" },
    @{ Id="07"; File="redesign-07-review.md";    Model="claude-fable-5"; Effort="xhigh"; Label="Review + verifikacija + REPORT-FINAL (bez push)" }
)

$LastId = $Steps[-1].Id

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
    exit 1
}

foreach ($s in $Steps) {
    $p = Join-Path $PromptDir $s.File
    if (-not (Test-Path $p)) {
        Write-Host "GRESKA: nedostaje prompt fajl $p" -ForegroundColor Red
        exit 1
    }
}

# Timeouts - build/lint/dev znaju da potraju.
$env:BASH_DEFAULT_TIMEOUT_MS              = "1800000"   # 30 min
$env:BASH_MAX_TIMEOUT_MS                  = "2700000"   # 45 min
$env:API_TIMEOUT_MS                       = "1800000"   # 30 min
$env:CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS = "1800000"   # 30 min

# Ne daj Windowsu da zaspi usred noci.
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
} catch {
    $SleepBlocked = $false
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host " ENIGMA DIGITAL - nocni lanac: REDIZAJN" -ForegroundColor Cyan
Write-Host " Start:   $(Get-Date -Format 'dd.MM.yyyy HH:mm:ss')"
Write-Host " Repo:    $ProjectRoot"
Write-Host " Grana:   feat/redesign-clean (LOKALNO, bez push)"
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

# Preflight koristi ISTI mehanizam kao koraci (prompt preko stdin), da odmah uhvati
# ovakve probleme umesto da potrosi noc.
"Odgovori tacno jednom recju: OK" | & claude -p $RunInstr --model claude-sonnet-5 --effort low --permission-mode bypassPermissions *> $PreflightLog
$PreflightCode = $LASTEXITCODE

if ($PreflightCode -ne 0) {
    Write-Host ""
    Write-Host "PREFLIGHT PAO (exit $PreflightCode). Lanac nije pokrenut." -ForegroundColor Red
    Write-Host "Log: $PreflightLog" -ForegroundColor Red
    Write-Host "Najcesci uzrok: verzija Claude Code-a ne podrzava --effort ili --permission-mode." -ForegroundColor Yellow
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

    $IsLast = ($Step.Id -eq $LastId)

    # Zavrsni review (07) se pusta UVEK, i kad je lanac pukao ranije.
    if ($ChainDead -and -not $IsLast) {
        Write-Host "[$($Step.Id)] PRESKOCENO - raniji korak je pao" -ForegroundColor DarkYellow
        $Results += [pscustomobject]@{
            Korak = $Step.Id; Naziv = $Step.Label; Status = "PRESKOCENO"; Trajanje = "-"; Log = "-"
        }
        continue
    }

    $PromptPath = Join-Path $PromptDir $Step.File
    $Prompt     = Get-Content $PromptPath -Raw -Encoding UTF8
    $LogPath    = Join-Path $LogDir ("{0}_{1}.log" -f $Step.Id, $Stamp)
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
            Write-Host ""
            Write-Host "[$($Step.Id)] pao (exit $ExitCode), jedan ponovni pokusaj" -ForegroundColor Yellow
            $LogPath = Join-Path $LogDir ("{0}_{1}_retry.log" -f $Step.Id, $Stamp)
        }

        $Prompt | & claude -p $RunInstr --model $Step.Model --effort $Step.Effort --permission-mode bypassPermissions 2>&1 | Tee-Object -FilePath $LogPath

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
$Summary += "Enigma Digital - nocni lanac: REDIZAJN"
$Summary += ("Start: {0}   Kraj: {1}   Ukupno: {2}" -f $RunStart.ToString('dd.MM.yyyy HH:mm:ss'), (Get-Date -Format 'dd.MM.yyyy HH:mm:ss'), $TotalDur)
$Summary += ""
$Summary += ($Results | Format-Table -AutoSize | Out-String)
$Summary += ""
$Summary += "Procitaj:      showcase\redesign\REPORT-FINAL.md (glavni), REPORT-01..06.md"
$Summary += "Screenshotovi: showcase\redesign\review\ (ako je Playwright bio dostupan)"
$Summary += "Grana:         feat/redesign-clean  --  NIJE push-ovana, nista nije deploy-ovano"
$Summary += "Pregled:       git switch feat/redesign-clean  &&  npm run dev"
$Summary += "Vracanje:      git switch main   (main je netaknut)"
$Summary | Set-Content -Path $SummaryPath -Encoding UTF8

Write-Host ""
Write-Host "PROCITAJ UJUTRU:" -ForegroundColor Yellow
Write-Host "   showcase\redesign\REPORT-FINAL.md   (glavni izvestaj)"
Write-Host "   $SummaryPath"
Write-Host "   Grana feat/redesign-clean (lokalno, bez push). Pregled: git switch feat/redesign-clean; npm run dev"
Write-Host ""

# Vrati normalno ponasanje spavanja
try { [Win32.Power]::SetThreadExecutionState([uint32]2147483648) | Out-Null } catch {}

$Failed = @($Results | Where-Object { $_.Status -ne "OK" -and $_.Status -ne "PRESKOCENO" })
if ($Failed.Count -gt 0) { exit 1 } else { exit 0 }
