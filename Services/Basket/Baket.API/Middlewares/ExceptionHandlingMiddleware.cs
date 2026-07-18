using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace Baket.API.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = HttpStatusCode.InternalServerError;
            var title = "Server Error";
            var detail = exception.Message;

            if (exception is ValidationException validationException)
            {
                statusCode = HttpStatusCode.BadRequest;
                title = "Validation Failed";
                title = exception.Message;

                detail = validationException.Message;
            }
            else if (exception is BuildingBlocks.Exceptions.NotFoundException notFoundException)
            {
                statusCode = HttpStatusCode.NotFound;
                title = "Not Found";
                detail = notFoundException.Message;
            }

            context.Response.StatusCode = (int)statusCode;


            var problemDetails = new ProblemDetails
            {
                Status = (int)statusCode,
                Title = title,
                Detail = detail,
                Instance = context.Request.Path
            };


            var jsonResponse = JsonSerializer.Serialize(problemDetails);
            return context.Response.WriteAsync(jsonResponse);
        }
    }
}
