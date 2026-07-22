using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using FluentValidation;

namespace BuildingBlocks.Exceptions.Handler
{
    public class CustomExceptionHandler
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CustomExceptionHandler> _logger;

        // Shared options instance — avoids allocating a new one per request.
        // Includes JsonStringEnumConverter so enum values in ProblemDetails
        // extensions are serialised as string names, not integers.
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy         = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition       = JsonIgnoreCondition.WhenWritingNull,
            Converters                   = { new JsonStringEnumConverter() }
        };

        public CustomExceptionHandler(RequestDelegate next, ILogger<CustomExceptionHandler> logger)
        {
            _next   = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Unhandled exception [{ExceptionType}] on {Method} {Path}: {Message}",
                    exception.GetType().Name,
                    context.Request.Method,
                    context.Request.Path,
                    exception.Message);

                await HandleExceptionAsync(context, exception);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/problem+json";

            (string Detail, string Title, int StatusCode) details = exception switch
            {
                InternalServerException =>
                (
                    exception.Message,
                    exception.GetType().Name,
                    StatusCodes.Status500InternalServerError
                ),
                ValidationException =>
                (
                    exception.Message,
                    exception.GetType().Name,
                    StatusCodes.Status400BadRequest
                ),
                BadRequestException =>
                (
                    exception.Message,
                    exception.GetType().Name,
                    StatusCodes.Status400BadRequest
                ),
                NotFoundException =>
                (
                    exception.Message,
                    exception.GetType().Name,
                    StatusCodes.Status404NotFound
                ),
                UnauthorizedAccessException =>
                (
                    exception.Message,
                    "Unauthorized",
                    StatusCodes.Status401Unauthorized
                ),
                _ =>
                (
                    exception.Message,
                    exception.GetType().Name,
                    StatusCodes.Status500InternalServerError
                )
            };

            var problemDetails = new ProblemDetails
            {
                Title    = details.Title,
                Detail   = details.Detail,
                Status   = details.StatusCode,
                Instance = context.Request.Path
            };

            problemDetails.Extensions["traceId"] = context.TraceIdentifier;

            if (exception is ValidationException validationException)
            {
                // Group errors by property name and attach as RFC 7807 extension.
                var errorDict = validationException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );
                problemDetails.Extensions["errors"] = errorDict;
            }

            if (exception is BadRequestException { Details: not null } badReq)
            {
                problemDetails.Extensions["details"] = badReq.Details;
            }

            context.Response.StatusCode = details.StatusCode;

            // Use the shared options (JsonStringEnumConverter + camelCase).
            return context.Response.WriteAsync(
                JsonSerializer.Serialize(problemDetails, _jsonOptions));
        }
    }
}
