// File: Controllers/QuarantineController.cs
using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Quarantine.Backend.Controllers
{
    [Authorize]                                // ← todas las peticiones deben estar autenticadas
    [ApiController]
    [Route("api/[controller]")]
    public class QuarantineController : ControllerBase
    {
        private const string AppId = "47286e1b-2351-432d-90ef-0080252fe31b";
        private const string Thumbprint = "E190C2B0F724ABC583134B54ED55CCDB7A0507B3";
        private const string Organization = "M365x55313402.onmicrosoft.com";

        // --- GET /api/quarantine?domain=...
        [HttpGet]
        public IActionResult Get([FromQuery] string domain)
        {
            if (string.IsNullOrWhiteSpace(domain))
                return BadRequest(new { error = "Se requiere el parámetro 'domain'." });

            var psCommand = $@"
Import-Module ExchangeOnlineManagement -DisableNameChecking;
Connect-ExchangeOnline `
  -AppId {AppId} `
  -CertificateThumbprint {Thumbprint} `
  -Organization {Organization} `
  -ShowBanner:$false `
  -ShowProgress:$false `
  -ErrorAction Stop;
Get-QuarantineMessage -RecipientAddress '*@{domain}.online' |
  Select-Object ReceivedTime,SenderAddress,RecipientAddress,Subject,MessageId |
  ConvertTo-Json -Depth 2;
Disconnect-ExchangeOnline -Confirm:$false;
";

            try
            {
                var output = RunScriptAndReturnOutput(psCommand);
                return Content(output, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // --- GET /api/quarantine/preview?messageId=...
        [HttpGet("preview")]
        public IActionResult Preview([FromQuery] string messageId)
        {
            if (string.IsNullOrWhiteSpace(messageId))
                return BadRequest(new { error = "Se requiere messageId." });

            var psCommand = $@"
Import-Module ExchangeOnlineManagement -DisableNameChecking;
Connect-ExchangeOnline `
  -AppId {AppId} `
  -CertificateThumbprint {Thumbprint} `
  -Organization {Organization} `
  -ShowBanner:$false `
  -ShowProgress:$false `
  -ErrorAction Stop;
Get-QuarantineMessage -MessageId '{messageId}' |
  Select-Object BodyPreview,MessageBodyHtml |
  ConvertTo-Json -Depth 2;
Disconnect-ExchangeOnline -Confirm:$false;
";
            try
            {
                var output = RunScriptAndReturnOutput(psCommand);
                return Content(output, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // --- POST /api/quarantine/release
        [HttpPost("release")]
        public IActionResult Release([FromBody] MsgAction req) =>
            ExecuteAction(req.MessageId,
                $"Release-QuarantineMessage -Identity '{req.MessageId}' -Confirm:$false");

        // --- POST /api/quarantine/deny
        [HttpPost("deny")]
        public IActionResult Deny([FromBody] MsgAction req) =>
            ExecuteAction(req.MessageId,
                $"Set-QuarantineMessage -Identity '{req.MessageId}' -ReleaseStatus Deny -Confirm:$false");

        // --- POST /api/quarantine/delete
        [HttpPost("delete")]
        public IActionResult Delete([FromBody] MsgAction req) =>
            ExecuteAction(req.MessageId,
                $"Remove-QuarantineMessage -Identity '{req.MessageId}' -Confirm:$false");

        // Helper para acciones (release, deny, delete)
        private IActionResult ExecuteAction(string messageId, string command)
        {
            if (string.IsNullOrWhiteSpace(messageId))
                return BadRequest(new { error = "Se requiere messageId." });

            var psCommand = $@"
Import-Module ExchangeOnlineManagement -DisableNameChecking;
Connect-ExchangeOnline `
  -AppId {AppId} `
  -CertificateThumbprint {Thumbprint} `
  -Organization {Organization} `
  -ShowBanner:$false `
  -ShowProgress:$false `
  -ErrorAction Stop;
{command};
Disconnect-ExchangeOnline -Confirm:$false;
";
            try
            {
                RunScriptAndReturnOutput(psCommand);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Lanza pwsh y devuelve stdout (lanza excepción si hay error)
        private static string RunScriptAndReturnOutput(string script)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "pwsh",
                Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{script}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            string stdout = process.StandardOutput.ReadToEnd();
            string stderr = process.StandardError.ReadToEnd();
            process.WaitForExit();

            if (process.ExitCode != 0)
                throw new Exception(stderr.Trim());

            return stdout.Trim();
        }

        // DTO para las acciones POST
        public class MsgAction
        {
            public string MessageId { get; set; }
        }
    }
}
