// File: Controllers/QuarantineController.cs
using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;    // ← necesario para [Authorize]

namespace Quarantine.Backend.Controllers
{
    [Authorize]                                // ← todas las peticiones a este controlador
    [ApiController]
    [Route("api/[controller]")]
    public class QuarantineController : ControllerBase
    {
        private const string AppId = "47286e1b-2351-432d-90ef-0080252fe31b";
        private const string Thumbprint = "E190C2B0F724ABC583134B54ED55CCDB7A0507B3";
        private const string Organization = "M365x55313402.onmicrosoft.com";

        [HttpGet]
        public IActionResult Get([FromQuery] string domain)
        {
            if (string.IsNullOrWhiteSpace(domain))
                return BadRequest(new { error = "Se requiere el parámetro 'domain'." });

            // Prepara el comando de PowerShell usando pwsh
            string psCommand = $@"
Import-Module ExchangeOnlineManagement -DisableNameChecking;
Connect-ExchangeOnline `
  -AppId {AppId} `
  -CertificateThumbprint {Thumbprint} `
  -Organization {Organization} `
  -ShowBanner:$false `
  -ShowProgress:$false `
  -ErrorAction Stop;
Get-QuarantineMessage -RecipientAddress '*@{domain}.online' |
  Select-Object ReceivedTime,SenderAddress,RecipientAddress,Subject |
  ConvertTo-Json -Depth 2;
Disconnect-ExchangeOnline -Confirm:$false;
";

            var startInfo = new ProcessStartInfo
            {
                FileName = "pwsh",
                Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{psCommand}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            try
            {
                using var process = Process.Start(startInfo);
                string output = process.StandardOutput.ReadToEnd();
                string error  = process.StandardError.ReadToEnd();
                process.WaitForExit();

                if (process.ExitCode != 0)
                    return StatusCode(500, new { error = error.Trim() });

                // Devuelve JSON limpio (sin líneas de banner)
                return Content(output.Trim(), "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    exception  = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}
